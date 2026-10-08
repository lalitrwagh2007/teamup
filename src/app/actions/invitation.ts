"use server";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

import { createClient } from "@/lib/supabase/server";

type InvitationResult = {
  success: boolean;
  error?: string;
};

type InvitationLinkResult = {
  success: boolean;
  token?: string;
  teamId?: string;
  error?: string;
};

type InvitationTokenResult = {
  success: boolean;
  invitation?: {
    id: string;
    team_id: string;
    role_id: string | null;
    inviter_id: string;
    invitee_id: string;
    message: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
};

function getInviteSecret() {
  const secret = process.env.INVITATION_TOKEN_SECRET;

  if (!secret) {
    throw new Error("INVITATION_TOKEN_SECRET is not configured");
  }

  return createHash("sha256").update(secret).digest();
}

function toBase64Url(value: Buffer) {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");

  return Buffer.from(
    padded + "=".repeat((4 - (padded.length % 4)) % 4),
    "base64",
  );
}

function createInvitationToken(invitationId: string, teamId: string) {
  const key = getInviteSecret();
  const iv = randomBytes(12);

  const payload = JSON.stringify({
    invitationId,
    teamId,
    nonce: randomBytes(16).toString("hex"),
  });

  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    toBase64Url(iv),
    toBase64Url(encrypted),
    toBase64Url(authTag),
  ].join(".");
}

function verifyInvitationToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 4 || parts[0] !== "v1") {
    return null;
  }

  try {
    const [, ivPart, encryptedPart, authTagPart] = parts;

    const key = getInviteSecret();
    const iv = fromBase64Url(ivPart);
    const encrypted = fromBase64Url(encryptedPart);
    const authTag = fromBase64Url(authTagPart);

    if (iv.length !== 12 || authTag.length !== 16) {
      return null;
    }

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    const payload = JSON.parse(decrypted);

    if (
      typeof payload.invitationId !== "string" ||
      typeof payload.teamId !== "string"
    ) {
      return null;
    }

    return {
      invitationId: payload.invitationId,
      teamId: payload.teamId,
    };
  } catch {
    return null;
  }
}

export async function createInvitation(input: {
  teamId: string;
  roleId?: string | null;
  inviteeId: string;
  message?: string | null;
}): Promise<InvitationResult & { invitationId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, owner_id")
    .eq("id", input.teamId)
    .single();

  if (teamError || !team) {
    return {
      success: false,
      error: "Team not found.",
    };
  }

  if (team.owner_id !== user.id) {
    return {
      success: false,
      error: "Only the team owner can send invitations.",
    };
  }

  if (input.inviteeId === user.id) {
    return {
      success: false,
      error: "You cannot invite yourself.",
    };
  }

  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", input.teamId)
    .eq("user_id", input.inviteeId)
    .maybeSingle();

  if (existingMember) {
    return {
      success: false,
      error: "This user is already a team member.",
    };
  }

  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("team_id", input.teamId)
    .eq("invitee_id", input.inviteeId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    return {
      success: false,
      error: "An active invitation already exists.",
    };
  }

  if (input.roleId) {
    const { data: role, error: roleError } = await supabase
      .from("team_roles")
      .select("id, team_id")
      .eq("id", input.roleId)
      .single();

    if (roleError || !role || role.team_id !== input.teamId) {
      return {
        success: false,
        error: "Invalid team role.",
      };
    }
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .insert({
      team_id: input.teamId,
      role_id: input.roleId ?? null,
      inviter_id: user.id,
      invitee_id: input.inviteeId,
      message: input.message ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (invitationError || !invitation) {
    return {
      success: false,
      error: invitationError?.message ?? "Failed to create invitation.",
    };
  }

  return {
    success: true,
    invitationId: invitation.id,
  };
}

export async function createInvitationLink(
  invitationId: string,
): Promise<InvitationLinkResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id, team_id, inviter_id, status")
    .eq("id", invitationId)
    .single();

  if (error || !invitation) {
    return {
      success: false,
      error: "Invitation not found.",
    };
  }

  if (invitation.inviter_id !== user.id) {
    return {
      success: false,
      error: "You are not authorized to create this invitation link.",
    };
  }

  if (invitation.status !== "pending") {
    return {
      success: false,
      error: "This invitation is no longer active.",
    };
  }

  return {
    success: true,
    token: createInvitationToken(
      invitation.id,
      invitation.team_id,
    ),
    teamId: invitation.team_id,
  };
}

export async function getInvitationByToken(
  token: string,
): Promise<InvitationTokenResult> {
  if (!token || token.length > 4096) {
    return {
      success: false,
      error: "Invalid invitation token.",
    };
  }

  const payload = verifyInvitationToken(token);

  if (!payload) {
    return {
      success: false,
      error: "Invalid or corrupted invitation link.",
    };
  }

  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(
      "id, team_id, role_id, inviter_id, invitee_id, message, status, created_at, updated_at",
    )
    .eq("id", payload.invitationId)
    .eq("team_id", payload.teamId)
    .single();

  if (error || !invitation) {
    return {
      success: false,
      error: "Invitation not found.",
    };
  }

  if (invitation.status !== "pending") {
    return {
      success: false,
      error: "This invitation is no longer active.",
    };
  }

  return {
    success: true,
    invitation,
  };
}

export async function acceptInvitation(
  invitationId: string,
): Promise<InvitationResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("id, team_id, role_id, invitee_id, status")
    .eq("id", invitationId)
    .single();

  if (invitationError || !invitation) {
    return {
      success: false,
      error: "Invitation not found.",
    };
  }

  if (invitation.invitee_id !== user.id) {
    return {
      success: false,
      error: "This invitation is not addressed to you.",
    };
  }

  if (invitation.status !== "pending") {
    return {
      success: false,
      error: "This invitation is no longer active.",
    };
  }

  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", invitation.team_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMember) {
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role_id: invitation.role_id,
        member_role: "member",
      });

    if (memberError) {
      return {
        success: false,
        error: memberError.message,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      status: "accepted",
    })
    .eq("id", invitation.id)
    .eq("status", "pending");

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
  };
}

export async function rejectInvitation(
  invitationId: string,
): Promise<InvitationResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("id, invitee_id, status")
    .eq("id", invitationId)
    .single();

  if (invitationError || !invitation) {
    return {
      success: false,
      error: "Invitation not found.",
    };
  }

  if (invitation.invitee_id !== user.id) {
    return {
      success: false,
      error: "This invitation is not addressed to you.",
    };
  }

  if (invitation.status !== "pending") {
    return {
      success: false,
      error: "This invitation is no longer active.",
    };
  }

  const { error } = await supabase
    .from("invitations")
    .update({
      status: "rejected",
    })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function getMyInvitations() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      invitations: [],
      error: "You must be signed in.",
    };
  }

  const { data, error } = await supabase
    .from("invitations")
    .select(
      `
        id,
        team_id,
        role_id,
        inviter_id,
        invitee_id,
        message,
        status,
        created_at,
        updated_at
      `,
    )
    .eq("invitee_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      invitations: [],
      error: error.message,
    };
  }

  return {
    success: true,
    invitations: data ?? [],
  };
}
