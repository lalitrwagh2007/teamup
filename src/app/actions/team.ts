"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import type {
  AvailableRoleSkill,
  CreateTeamInput,
  CreateTeamRoleInput,
  TeamActionResult,
  TeamDetails,
  TeamMemberDetail,
  TeamOwner,
  TeamRecord,
  TeamRoleDetail,
  TeamRoleSkill,
  TeamStatus,
  TeamTrack,
  UpdateTeamInput,
  WorkMode,
} from "@/types/team";

interface TeamRow {
  id: string;
  leader_id: string | null;
  name: string;
  description: string | null;
  track: TeamTrack;
  category: string | null;
  avatar_url: string | null;
  mode: WorkMode | null;
  location: string | null;
  max_members: number;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

const VALID_TRACKS: TeamTrack[] = ["technical", "community"];

const VALID_MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

const VALID_STATUSES: TeamStatus[] = [
  "recruiting",
  "in_progress",
  "completed",
  "archived",
];

function mapTeam(row: TeamRow): TeamRecord {
  return {
    id: row.id,
    leaderId: row.leader_id,
    name: row.name,
    description: row.description,
    track: row.track,
    category: row.category,
    avatarUrl: row.avatar_url,
    mode: row.mode,
    location: row.location,
    maxMembers: row.max_members,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function cleanOptionalText(
  value: string | null | undefined,
  maxLength: number,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function validateCreateTeam(input: CreateTeamInput):
  | {
      valid: true;
      data: {
        name: string;
        description: string | null;
        track: TeamTrack;
        category: string | null;
        avatarUrl: string | null;
        mode: WorkMode | null;
        location: string | null;
        maxMembers: number;
      };
    }
  | {
      valid: false;
      error: string;
    } {
  const name = input.name?.trim();

  if (!name) {
    return {
      valid: false,
      error: "Team name is required.",
    };
  }

  if (name.length > 120) {
    return {
      valid: false,
      error: "Team name must be 120 characters or fewer.",
    };
  }

  if (!VALID_TRACKS.includes(input.track)) {
    return {
      valid: false,
      error: "Invalid team track.",
    };
  }

  if (
    input.mode !== undefined &&
    input.mode !== null &&
    !VALID_MODES.includes(input.mode)
  ) {
    return {
      valid: false,
      error: "Invalid work mode.",
    };
  }

  const maxMembers = input.maxMembers ?? 5;

  if (!Number.isInteger(maxMembers) || maxMembers < 1 || maxMembers > 100) {
    return {
      valid: false,
      error: "Maximum members must be between 1 and 100.",
    };
  }

  return {
    valid: true,
    data: {
      name,
      description: cleanOptionalText(input.description, 2000) ?? null,
      track: input.track,
      category: cleanOptionalText(input.category, 120) ?? null,
      avatarUrl: cleanOptionalText(input.avatarUrl, 2048) ?? null,
      mode: input.mode ?? null,
      location: cleanOptionalText(input.location, 160) ?? null,
      maxMembers,
    },
  };
}

function validateUpdateTeam(input: UpdateTeamInput):
  | {
      valid: true;
      data: UpdateTeamInput;
    }
  | {
      valid: false;
      error: string;
    } {
  const data: UpdateTeamInput = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      return {
        valid: false,
        error: "Team name cannot be empty.",
      };
    }

    if (name.length > 120) {
      return {
        valid: false,
        error: "Team name must be 120 characters or fewer.",
      };
    }

    data.name = name;
  }

  if (input.description !== undefined) {
    data.description = cleanOptionalText(input.description, 2000) ?? null;
  }

  if (input.track !== undefined) {
    if (!VALID_TRACKS.includes(input.track)) {
      return {
        valid: false,
        error: "Invalid team track.",
      };
    }

    data.track = input.track;
  }

  if (input.category !== undefined) {
    data.category = cleanOptionalText(input.category, 120) ?? null;
  }

  if (input.avatarUrl !== undefined) {
    data.avatarUrl = cleanOptionalText(input.avatarUrl, 2048) ?? null;
  }

  if (input.mode !== undefined) {
    if (input.mode !== null && !VALID_MODES.includes(input.mode)) {
      return {
        valid: false,
        error: "Invalid work mode.",
      };
    }

    data.mode = input.mode;
  }

  if (input.location !== undefined) {
    data.location = cleanOptionalText(input.location, 160) ?? null;
  }

  if (input.maxMembers !== undefined) {
    if (
      !Number.isInteger(input.maxMembers) ||
      input.maxMembers < 1 ||
      input.maxMembers > 100
    ) {
      return {
        valid: false,
        error: "Maximum members must be between 1 and 100.",
      };
    }

    data.maxMembers = input.maxMembers;
  }

  if (input.status !== undefined) {
    if (!VALID_STATUSES.includes(input.status)) {
      return {
        valid: false,
        error: "Invalid team status.",
      };
    }

    data.status = input.status;
  }

  if (Object.keys(data).length === 0) {
    return {
      valid: false,
      error: "No valid fields were provided.",
    };
  }

  return {
    valid: true,
    data,
  };
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

export async function createTeam(
  input: CreateTeamInput,
): Promise<TeamActionResult<TeamRecord>> {
  const validation = validateCreateTeam(input);

  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: validation.error,
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to create a team.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      leader_id: user.id,
      name: validation.data.name,
      description: validation.data.description,
      track: validation.data.track,
      category: validation.data.category,
      avatar_url: validation.data.avatarUrl,
      mode: validation.data.mode,
      location: validation.data.location,
      max_members: validation.data.maxMembers,
    })
    .select("*")
    .single();

  if (teamError || !team) {
    return {
      success: false,
      data: null,
      error: teamError?.message ?? "Failed to create team.",
    };
  }

  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    member_role: "leader",
  });

  if (memberError) {
    await supabase
      .from("teams")
      .delete()
      .eq("id", team.id)
      .eq("leader_id", user.id);

    return {
      success: false,
      data: null,
      error:
        memberError.message ??
        "Team was created but the creator could not be added as a member.",
    };
  }

  revalidatePath("/teams");
  revalidatePath("/explore");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: mapTeam(team as TeamRow),
    error: null,
  };
}

export async function getTeams(): Promise<TeamActionResult<TeamRecord[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  return {
    success: true,
    data: ((data ?? []) as TeamRow[]).map(mapTeam),
    error: null,
  };
}

export async function getTeamById(
  teamId: string,
): Promise<TeamActionResult<TeamRecord>> {
  if (!isValidUuid(teamId)) {
    return {
      success: false,
      data: null,
      error: "Invalid team ID.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      success: false,
      data: null,
      error: "Team not found.",
    };
  }

  return {
    success: true,
    data: mapTeam(data as TeamRow),
    error: null,
  };
}
export async function isTeamOwner(teamId: string): Promise<boolean> {
  if (!isValidUuid(teamId)) {
    return false;
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.leader_id === user.id;
}
export async function getTeamDetails(
  teamId: string,
): Promise<TeamActionResult<TeamDetails>> {
  if (!isValidUuid(teamId)) {
    return {
      success: false,
      data: null,
      error: "Invalid team ID.",
    };
  }

  const supabase = await createClient();

  const teamResult = await getTeamById(teamId);

  if (!teamResult.success) {
    return {
      success: false,
      data: null,
      error: teamResult.error,
    };
  }

  const team = teamResult.data;

  let owner: TeamOwner | null = null;

  if (team.leaderId) {
    const { data: ownerRow, error: ownerError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", team.leaderId)
      .maybeSingle();

    if (ownerError) {
      return {
        success: false,
        data: null,
        error: ownerError.message,
      };
    }

    if (ownerRow) {
      owner = {
        id: ownerRow.id,
        name: ownerRow.full_name,
        avatarUrl: ownerRow.avatar_url,
      };
    }
  }

  const { data: memberRows, error: memberError } = await supabase
    .from("team_members")
    .select("id, user_id, member_role, joined_at")
    .eq("team_id", teamId)
    .order("joined_at", {
      ascending: true,
    });

  if (memberError) {
    return {
      success: false,
      data: null,
      error: memberError.message,
    };
  }

  const memberUserIds = [
    ...new Set((memberRows ?? []).map((member) => member.user_id)),
  ];

  const memberProfileMap = new Map<string, TeamOwner>();

  if (memberUserIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", memberUserIds);

    if (profileError) {
      return {
        success: false,
        data: null,
        error: profileError.message,
      };
    }

    for (const profile of profileRows ?? []) {
      memberProfileMap.set(profile.id, {
        id: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
      });
    }
  }

  const members: TeamMemberDetail[] = (memberRows ?? []).map((member) => ({
    id: member.id,
    userId: member.user_id,
    memberRole: member.member_role,
    joinedAt: member.joined_at,
    profile: memberProfileMap.get(member.user_id) ?? null,
  }));

  const { data: roleRows, error: roleError } = await supabase
    .from("team_roles")
    .select("id, title, description, spots_total, spots_filled, status")
    .eq("team_id", teamId)
    .order("created_at", {
      ascending: true,
    });

  if (roleError) {
    return {
      success: false,
      data: null,
      error: roleError.message,
    };
  }

  const openRoleRows = (roleRows ?? []).filter(
    (role) => role.status === "open",
  );

  const roleIds = openRoleRows.map((role) => role.id);

  const skillsByRole = new Map<string, TeamRoleSkill[]>();

  if (roleIds.length > 0) {
    const { data: roleSkillRows, error: roleSkillError } = await supabase
      .from("team_role_skills")
      .select("role_id, skill_id")
      .in("role_id", roleIds);

    if (roleSkillError) {
      return {
        success: false,
        data: null,
        error: roleSkillError.message,
      };
    }

    const skillIds = [
      ...new Set((roleSkillRows ?? []).map((row) => row.skill_id)),
    ];

    const skillMap = new Map<string, TeamRoleSkill>();

    if (skillIds.length > 0) {
      const { data: skillRows, error: skillError } = await supabase
        .from("skills")
        .select("id, name")
        .in("id", skillIds);

      if (skillError) {
        return {
          success: false,
          data: null,
          error: skillError.message,
        };
      }

      for (const skill of skillRows ?? []) {
        skillMap.set(skill.id, {
          id: skill.id,
          name: skill.name,
        });
      }
    }

    for (const row of roleSkillRows ?? []) {
      const skill = skillMap.get(row.skill_id);

      if (!skill) {
        continue;
      }

      const existing = skillsByRole.get(row.role_id) ?? [];

      existing.push(skill);

      skillsByRole.set(row.role_id, existing);
    }
  }

  const roles: TeamRoleDetail[] = openRoleRows.map((role) => ({
    id: role.id,
    title: role.title,
    description: role.description,
    spotsTotal: role.spots_total,
    spotsFilled: role.spots_filled,
    status: role.status,
    requiredSkills: skillsByRole.get(role.id) ?? [],
  }));

  return {
    success: true,
    data: {
      ...team,
      owner,
      members,
      roles,
      currentMembers: members.length,
    },
    error: null,
  };
}
export async function getAvailableRoleSkills(): Promise<
  TeamActionResult<AvailableRoleSkill[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .order("name", {
      ascending: true,
    });

  if (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  return {
    success: true,
    data: (data ?? []).map((skill) => ({
      id: skill.id,
      name: skill.name,
    })),
    error: null,
  };
}

export async function createTeamRole(
  teamId: string,
  input: CreateTeamRoleInput,
): Promise<TeamActionResult<TeamRoleDetail>> {
  if (!isValidUuid(teamId)) {
    return {
      success: false,
      data: null,
      error: "Invalid team ID.",
    };
  }

  const title = input.title?.trim();
  const description = input.description?.trim() || null;
  const spotsTotal = Number(input.spotsTotal);

  const skillIds = [
    ...new Set(
      (input.skillIds ?? []).filter((skillId) => isValidUuid(skillId)),
    ),
  ];

  if (!title) {
    return {
      success: false,
      data: null,
      error: "Role title is required.",
    };
  }

  if (title.length > 100) {
    return {
      success: false,
      data: null,
      error: "Role title must be 100 characters or fewer.",
    };
  }

  if (description && description.length > 1000) {
    return {
      success: false,
      data: null,
      error: "Role description must be 1000 characters or fewer.",
    };
  }

  if (!Number.isInteger(spotsTotal) || spotsTotal < 1 || spotsTotal > 100) {
    return {
      success: false,
      data: null,
      error: "Available spots must be between 1 and 100.",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to create a team role.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    return {
      success: false,
      data: null,
      error: teamError.message,
    };
  }

  if (!team) {
    return {
      success: false,
      data: null,
      error: "Team not found.",
    };
  }

  if (team.leader_id !== user.id) {
    return {
      success: false,
      data: null,
      error: "Only the team owner can create roles.",
    };
  }

  let selectedSkills: AvailableRoleSkill[] = [];

  if (skillIds.length > 0) {
    const { data: skills, error: skillsError } = await supabase
      .from("skills")
      .select("id, name")
      .in("id", skillIds);

    if (skillsError) {
      return {
        success: false,
        data: null,
        error: skillsError.message,
      };
    }

    if ((skills ?? []).length !== skillIds.length) {
      return {
        success: false,
        data: null,
        error: "One or more selected skills do not exist.",
      };
    }

    selectedSkills = (skills ?? []).map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));
  }

  const { data: role, error: roleError } = await supabase
    .from("team_roles")
    .insert({
      team_id: teamId,
      title,
      description,
      spots_total: spotsTotal,
      spots_filled: 0,
      status: "open",
    })
    .select("id, title, description, spots_total, spots_filled, status")
    .single();

  if (roleError || !role) {
    return {
      success: false,
      data: null,
      error: roleError?.message ?? "Unable to create team role.",
    };
  }

  if (skillIds.length > 0) {
    const roleSkillRows = skillIds.map((skillId) => ({
      role_id: role.id,
      skill_id: skillId,
    }));

    const { error: roleSkillsError } = await supabase
      .from("team_role_skills")
      .insert(roleSkillRows);

    if (roleSkillsError) {
      await supabase
        .from("team_roles")
        .delete()
        .eq("id", role.id)
        .eq("team_id", teamId);

      return {
        success: false,
        data: null,
        error: roleSkillsError.message,
      };
    }
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/explore");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: role.id,
      title: role.title,
      description: role.description,
      spotsTotal: role.spots_total,
      spotsFilled: role.spots_filled,
      status: role.status,
      requiredSkills: selectedSkills,
    },
    error: null,
  };
}
export async function updateTeam(
  teamId: string,
  input: UpdateTeamInput,
): Promise<TeamActionResult<TeamRecord>> {
  if (!isValidUuid(teamId)) {
    return {
      success: false,
      data: null,
      error: "Invalid team ID.",
    };
  }

  const validation = validateUpdateTeam(input);

  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: validation.error,
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to update a team.",
    };
  }

  const { data: existingTeam, error: teamError } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    return {
      success: false,
      data: null,
      error: teamError.message,
    };
  }

  if (!existingTeam) {
    return {
      success: false,
      data: null,
      error: "Team not found.",
    };
  }

  if (existingTeam.leader_id !== user.id) {
    return {
      success: false,
      data: null,
      error: "You do not have permission to update this team.",
    };
  }

  const payload: Record<string, unknown> = {};

  if (validation.data.name !== undefined) {
    payload.name = validation.data.name;
  }

  if (validation.data.description !== undefined) {
    payload.description = validation.data.description;
  }

  if (validation.data.track !== undefined) {
    payload.track = validation.data.track;
  }

  if (validation.data.category !== undefined) {
    payload.category = validation.data.category;
  }

  if (validation.data.avatarUrl !== undefined) {
    payload.avatar_url = validation.data.avatarUrl;
  }

  if (validation.data.mode !== undefined) {
    payload.mode = validation.data.mode;
  }

  if (validation.data.location !== undefined) {
    payload.location = validation.data.location;
  }

  if (validation.data.maxMembers !== undefined) {
    payload.max_members = validation.data.maxMembers;
  }

  if (validation.data.status !== undefined) {
    payload.status = validation.data.status;
  }

  const { data, error } = await supabase
    .from("teams")
    .update(payload)
    .eq("id", teamId)
    .eq("leader_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      data: null,
      error: error?.message ?? "Failed to update team.",
    };
  }

  revalidatePath("/teams");
  revalidatePath("/explore");
  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    data: mapTeam(data as TeamRow),
    error: null,
  };
}

export async function deleteTeam(teamId: string): Promise<
  TeamActionResult<{
    id: string;
  }>
> {
  if (!isValidUuid(teamId)) {
    return {
      success: false,
      data: null,
      error: "Invalid team ID.",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to delete a team.",
    };
  }

  const { data: existingTeam, error: teamError } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    return {
      success: false,
      data: null,
      error: teamError.message,
    };
  }

  if (!existingTeam) {
    return {
      success: false,
      data: null,
      error: "Team not found.",
    };
  }

  if (existingTeam.leader_id !== user.id) {
    return {
      success: false,
      data: null,
      error: "You do not have permission to delete this team.",
    };
  }

  const { data, error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("leader_id", user.id)
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      data: null,
      error: error?.message ?? "Failed to delete team.",
    };
  }

  revalidatePath("/teams");
  revalidatePath("/explore");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
    },
    error: null,
  };
}
