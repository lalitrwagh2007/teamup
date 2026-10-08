"use server";

import { createClient } from "@/lib/supabase/server";

type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface ApplyToTeamInput {
  teamId: string;
  roleId: string;
  message?: string;
}

export interface Application {
  id: string;
  applicant_id: string;
  team_id: string;
  role_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = [
  "pending",
  "accepted",
];

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

export async function applyToTeam(
  input: ApplyToTeamInput,
): Promise<ApplicationActionResult<Application>> {
  try {
    const { teamId, roleId, message } = input;

    if (!isValidUUID(teamId) || !isValidUUID(roleId)) {
      return {
        success: false,
        error: "Invalid team or role ID.",
      };
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to apply to a team.",
      };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, owner_id")
      .eq("id", teamId)
      .maybeSingle();

    if (teamError || !team) {
      return {
        success: false,
        error: "Team not found.",
      };
    }

    if (team.owner_id === user.id) {
      return {
        success: false,
        error: "Team owners cannot apply to their own team.",
      };
    }

    const { data: role, error: roleError } = await supabase
      .from("team_roles")
      .select("id, team_id")
      .eq("id", roleId)
      .maybeSingle();

    if (roleError || !role) {
      return {
        success: false,
        error: "Role not found.",
      };
    }

    if (role.team_id !== teamId) {
      return {
        success: false,
        error: "The selected role does not belong to this team.",
      };
    }

    const { data: existingApplications, error: existingError } =
      await supabase
        .from("applications")
        .select("id, status")
        .eq("applicant_id", user.id)
        .eq("team_id", teamId)
        .eq("role_id", roleId)
        .in("status", ACTIVE_APPLICATION_STATUSES);

    if (existingError) {
      return {
        success: false,
        error: "Unable to check your existing applications.",
      };
    }

    if (existingApplications && existingApplications.length > 0) {
      return {
        success: false,
        error: "You already have an active application for this role.",
      };
    }

    const cleanMessage =
      typeof message === "string" ? message.trim() : null;

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        applicant_id: user.id,
        team_id: teamId,
        role_id: roleId,
        message: cleanMessage || null,
        status: "pending",
      })
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .single();

    if (applicationError) {
      console.error(applicationError);

      return {
        success: false,
        error: "Failed to submit your application.",
      };
    }

    return {
      success: true,
      data: application as Application,
    };
  } catch (error) {
    console.error("applyToTeam error:", error);

    return {
      success: false,
      error: "Something went wrong while submitting your application.",
    };
  }
}

export async function getMyApplications(): Promise<
  ApplicationActionResult<Application[]>
> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return {
        success: false,
        error: "Failed to load your applications.",
      };
    }

    return {
      success: true,
      data: (data ?? []) as Application[],
    };
  } catch (error) {
    console.error("getMyApplications error:", error);

    return {
      success: false,
      error: "Something went wrong while loading applications.",
    };
  }
}

export async function getTeamApplications(
  teamId: string,
): Promise<ApplicationActionResult<Application[]>> {
  try {
    if (!isValidUUID(teamId)) {
      return {
        success: false,
        error: "Invalid team ID.",
      };
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, owner_id")
      .eq("id", teamId)
      .maybeSingle();

    if (teamError || !team) {
      return {
        success: false,
        error: "Team not found.",
      };
    }

    if (team.owner_id !== user.id) {
      return {
        success: false,
        error: "Only the team owner can view applications.",
      };
    }

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return {
        success: false,
        error: "Failed to load team applications.",
      };
    }

    return {
      success: true,
      data: (data ?? []) as Application[],
    };
  } catch (error) {
    console.error("getTeamApplications error:", error);

    return {
      success: false,
      error: "Something went wrong while loading team applications.",
    };
  }
}

export async function acceptApplication(
  applicationId: string,
): Promise<ApplicationActionResult<Application>> {
  try {
    if (!isValidUUID(applicationId)) {
      return {
        success: false,
        error: "Invalid application ID.",
      };
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return {
        success: false,
        error: "Application not found.",
      };
    }

    if (application.status !== "pending") {
      return {
        success: false,
        error: "Only pending applications can be accepted.",
      };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, owner_id, max_members")
      .eq("id", application.team_id)
      .maybeSingle();

    if (teamError || !team) {
      return {
        success: false,
        error: "Team not found.",
      };
    }

    if (team.owner_id !== user.id) {
      return {
        success: false,
        error: "Only the team owner can accept applications.",
      };
    }

    const { count: memberCount, error: memberCountError } =
      await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", application.team_id);

    if (memberCountError) {
      console.error(memberCountError);

      return {
        success: false,
        error: "Unable to verify team capacity.",
      };
    }

    if (
      typeof team.max_members === "number" &&
      (memberCount ?? 0) >= team.max_members
    ) {
      return {
        success: false,
        error: "This team is already full.",
      };
    }

    const { data: existingMember, error: existingMemberError } =
      await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", application.team_id)
        .eq("user_id", application.applicant_id)
        .maybeSingle();

    if (existingMemberError) {
      console.error(existingMemberError);

      return {
        success: false,
        error: "Unable to verify team membership.",
      };
    }

    if (existingMember) {
      return {
        success: false,
        error: "This applicant is already a team member.",
      };
    }

    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: application.team_id,
        user_id: application.applicant_id,
        role_id: application.role_id,
      });

    if (memberError) {
      console.error(memberError);

      return {
        success: false,
        error: "Failed to add the applicant to the team.",
      };
    }

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("status", "pending")
        .select(
          "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
        )
        .single();

    if (updateError) {
      console.error(updateError);

      return {
        success: false,
        error: "Applicant was added, but the application status could not be updated.",
      };
    }

    return {
      success: true,
      data: updatedApplication as Application,
    };
  } catch (error) {
    console.error("acceptApplication error:", error);

    return {
      success: false,
      error: "Something went wrong while accepting the application.",
    };
  }
}

export async function rejectApplication(
  applicationId: string,
): Promise<ApplicationActionResult<Application>> {
  try {
    if (!isValidUUID(applicationId)) {
      return {
        success: false,
        error: "Invalid application ID.",
      };
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return {
        success: false,
        error: "Application not found.",
      };
    }

    if (application.status !== "pending") {
      return {
        success: false,
        error: "Only pending applications can be rejected.",
      };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, owner_id")
      .eq("id", application.team_id)
      .maybeSingle();

    if (teamError || !team) {
      return {
        success: false,
        error: "Team not found.",
      };
    }

    if (team.owner_id !== user.id) {
      return {
        success: false,
        error: "Only the team owner can reject applications.",
      };
    }

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("status", "pending")
        .select(
          "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
        )
        .single();

    if (updateError) {
      console.error(updateError);

      return {
        success: false,
        error: "Failed to reject the application.",
      };
    }

    return {
      success: true,
      data: updatedApplication as Application,
    };
  } catch (error) {
    console.error("rejectApplication error:", error);

    return {
      success: false,
      error: "Something went wrong while rejecting the application.",
    };
  }
}

export async function withdrawApplication(
  applicationId: string,
): Promise<ApplicationActionResult<Application>> {
  try {
    if (!isValidUUID(applicationId)) {
      return {
        success: false,
        error: "Invalid application ID.",
      };
    }

    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select(
        "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (fetchError || !application) {
      return {
        success: false,
        error: "Application not found.",
      };
    }

    if (application.applicant_id !== user.id) {
      return {
        success: false,
        error: "You can only withdraw your own applications.",
      };
    }

    if (application.status !== "pending") {
      return {
        success: false,
        error: "Only pending applications can be withdrawn.",
      };
    }

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("applicant_id", user.id)
        .eq("status", "pending")
        .select(
          "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
        )
        .single();

    if (updateError) {
      console.error(updateError);

      return {
        success: false,
        error: "Failed to withdraw the application.",
      };
    }

    return {
      success: true,
      data: updatedApplication as Application,
    };
  } catch (error) {
    console.error("withdrawApplication error:", error);

    return {
      success: false,
      error: "Something went wrong while withdrawing the application.",
    };
  }
}