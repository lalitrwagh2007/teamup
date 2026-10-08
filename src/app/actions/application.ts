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

/**
 * Apply to a team for a specific role.
 *
 * Rules:
 * - User must be authenticated.
 * - Team and role IDs must be valid UUIDs.
 * - Team must exist.
 * - Role must belong to the selected team.
 * - Team owner cannot apply to their own team.
 * - Duplicate active applications are prevented.
 */
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

    if (teamError) {
      console.error("Failed to fetch team:", teamError);

      return {
        success: false,
        error: "Unable to verify the team.",
      };
    }

    if (!team) {
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

    if (roleError) {
      console.error("Failed to fetch role:", roleError);

      return {
        success: false,
        error: "Unable to verify the selected role.",
      };
    }

    if (!role) {
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
      console.error(
        "Failed to check existing applications:",
        existingError,
      );

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
      console.error("Failed to create application:", applicationError);

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

/**
 * Get all applications submitted by the current user.
 */
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
      console.error("Failed to fetch applications:", error);

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

/**
 * Get applications for a team.
 *
 * Only the team owner is allowed to access them.
 */
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

    if (teamError) {
      console.error("Failed to fetch team:", teamError);

      return {
        success: false,
        error: "Unable to verify the team.",
      };
    }

    if (!team) {
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
      console.error("Failed to fetch team applications:", error);

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

async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected",
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

    if (applicationError) {
      console.error(
        "Failed to fetch application:",
        applicationError,
      );

      return {
        success: false,
        error: "Unable to find the application.",
      };
    }

    if (!application) {
      return {
        success: false,
        error: "Application not found.",
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
        error: "Unable to verify the team.",
      };
    }

    if (team.owner_id !== user.id) {
      return {
        success: false,
        error: "Only the team owner can manage applications.",
      };
    }

    if (application.status !== "pending") {
      return {
        success: false,
        error: "Only pending applications can be updated.",
      };
    }

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("status", "pending")
        .select(
          "id, applicant_id, team_id, role_id, message, status, created_at, updated_at",
        )
        .single();

    if (updateError) {
      console.error(
        "Failed to update application:",
        updateError,
      );

      return {
        success: false,
        error: `Failed to ${status === "accepted" ? "accept" : "reject"} the application.`,
      };
    }

    return {
      success: true,
      data: updatedApplication as Application,
    };
  } catch (error) {
    console.error("updateApplicationStatus error:", error);

    return {
      success: false,
      error: "Something went wrong while updating the application.",
    };
  }
}

/**
 * Accept an application.
 *
 * Team membership insertion/capacity handling will be implemented
 * in the later application-management prompt.
 */
export async function acceptApplication(
  applicationId: string,
): Promise<ApplicationActionResult<Application>> {
  return updateApplicationStatus(applicationId, "accepted");
}

/**
 * Reject an application.
 */
export async function rejectApplication(
  applicationId: string,
): Promise<ApplicationActionResult<Application>> {
  return updateApplicationStatus(applicationId, "rejected");
}

/**
 * Withdraw the current user's pending application.
 */
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

    if (fetchError) {
      console.error(
        "Failed to fetch application:",
        fetchError,
      );

      return {
        success: false,
        error: "Unable to find the application.",
      };
    }

    if (!application) {
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
      console.error(
        "Failed to withdraw application:",
        updateError,
      );

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