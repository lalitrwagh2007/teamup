"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  users: PublicUserProfile[];
  teams: PublicTeamProfile[];
}

export interface PublicUserProfile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  work_mode: "Remote" | "Hybrid" | "On-site" | null;
  team_status: "finding_team" | "already_have_team" | null;
  skills: string[];
  interests: string[];
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

export interface PublicTeamProfile {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  track: "technical" | "community";
  mode: "Remote" | "Hybrid" | "On-site" | null;
  location: string | null;
  current_members: number;
  max_members: number;
  open_roles: string[];
  required_skills: string[];
}

export interface SearchFilters {
  query?: string;
  type?: "all" | "people" | "teams";
  teamStatus?: "finding_team" | "already_have_team" | "all";
  skills?: string[];
  location?: string;
  workMode?: "Remote" | "Hybrid" | "On-site";
  track?: "technical" | "community";
  category?: string;
}

export async function searchUsers(filters: SearchFilters): Promise<{ success: boolean; data: PublicUserProfile[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, data: [], error: "Authentication required." };
    }

    let query = supabase
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        work_mode,
        team_status,
        github,
        linkedin,
        portfolio
      `)
      .neq("id", user.id); // Exclude current user

    // Apply text search
    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      query = query.or(
        `full_name.ilike.${searchTerm},username.ilike.${searchTerm},bio.ilike.${searchTerm},location.ilike.${searchTerm}`
      );
    }

    // Apply team status filter
    if (filters.teamStatus && filters.teamStatus !== "all") {
      query = query.eq("team_status", filters.teamStatus);
    }

    // Apply location filter
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    // Apply work mode filter
    if (filters.workMode) {
      query = query.eq("work_mode", filters.workMode);
    }

    // Apply skill filter (join with user_skills)
    if (filters.skills && filters.skills.length > 0) {
      // We need to join with user_skills and skills tables
      // For simplicity, we'll do a separate query for skills
      // and filter in application code, or use a more complex query
      // Here we'll fetch and filter
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Search users error:", error);
      return { success: false, data: [], error: "Failed to search users." };
    }

    // If skill filter is needed, we need to fetch user skills
    let usersWithSkills = data ?? [];

const skillsMap = new Map<string, string[]>();

if (filters.skills && filters.skills.length > 0) {
      // Fetch skills for these users
      const userIds = usersWithSkills.map((u) => u.id);
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select("user_id, skills(name)")
        .in("user_id", userIds);
      userSkills?.forEach((row) => {
        const skillNames = (row.skills ?? [])
          .map((skill) => skill.name?.toLowerCase())
          .filter((name): name is string => Boolean(name));

        if (skillNames.length > 0) {
          const existing = skillsMap.get(row.user_id) ?? [];
          existing.push(...skillNames);
          skillsMap.set(row.user_id, existing);
        }
      });

      const searchSkills = filters.skills.map((s) => s.toLowerCase());
      usersWithSkills = usersWithSkills.filter((user) => {
        const userSkillNames = skillsMap.get(user.id) ?? [];
        return searchSkills.every((skill) => userSkillNames.includes(skill));
      });
    }

    // Fetch interests for these users
    const userIds = usersWithSkills.map((u) => u.id);
    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("user_id, interests(name)")
      .in("user_id", userIds);

    const interestsMap = new Map<string, string[]>();
    userInterests?.forEach((row) => {
      const interestNames = (row.interests ?? [])
        .map((interest) => interest.name)
        .filter((name): name is string => Boolean(name));

      if (interestNames.length > 0) {
        const existing = interestsMap.get(row.user_id) ?? [];
        existing.push(...interestNames);
        interestsMap.set(row.user_id, existing);
      }
    });

    // Format results
    const formatted: PublicUserProfile[] = usersWithSkills.map((user) => ({
      id: user.id,
      name: user.full_name,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      location: user.location,
      work_mode: user.work_mode,
      team_status: user.team_status,
      skills: skillsMap?.get(user.id) ?? [],
      interests: interestsMap?.get(user.id) ?? [],
      github: user.github,
      linkedin: user.linkedin,
      portfolio: user.portfolio,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Search users error:", error);
    return { success: false, data: [], error: "An unexpected error occurred." };
  }
}

export async function searchTeams(filters: SearchFilters): Promise<{ success: boolean; data: PublicTeamProfile[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("teams")
      .select(`
        id,
        name,
        description,
        category,
        track,
        mode,
        location,
        max_members,
        status,
        team_members(count),
        team_roles!inner(
          id,
          title,
          status,
          team_role_skills(skills(name))
        )
      `)
      .eq("status", "recruiting");

    // Apply text search
    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},location.ilike.${searchTerm}`
      );
    }

    // Apply category filter
    if (filters.category) {
      query = query.ilike("category", `%${filters.category}%`);
    }

    // Apply track filter
    if (filters.track) {
      query = query.eq("track", filters.track);
    }

    // Apply location filter
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    // Apply work mode filter
    if (filters.workMode) {
      query = query.eq("mode", filters.workMode);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Search teams error:", error);
      return { success: false, data: [], error: "Failed to search teams." };
    }

    // Filter by required skills if provided
    let teams = data ?? [];

    if (filters.skills && filters.skills.length > 0) {
      const searchSkills = filters.skills.map((s) => s.toLowerCase());
      teams = teams.filter((team) => {
        const roleSkills =
          team.team_roles?.flatMap(
            (role) =>
              role.team_role_skills?.flatMap((trs) =>
                (trs.skills ?? [])
                  .map((skill) => skill.name?.toLowerCase())
                  .filter((name): name is string => Boolean(name)),
              ) ?? [],
          ) ?? [];
        return searchSkills.every((skill) => roleSkills.includes(skill));
      });
    }

    const formatted: PublicTeamProfile[] = teams.map((team) => {
      const openRoles = team.team_roles
        ?.filter((r: { status: string }) => r.status === "open")
        .map((r: { title: string }) => r.title) ?? [];

      const requiredSkills =
        team.team_roles?.flatMap(
          (role) =>
            role.team_role_skills?.flatMap((trs) =>
              (trs.skills ?? [])
                .map((skill) => skill.name)
                .filter((name): name is string => Boolean(name)),
            ) ?? [],
        ) ?? [];

      const memberCount = team.team_members?.[0]?.count ?? 1;

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        category: team.category,
        track: team.track,
        mode: team.mode,
        location: team.location,
        current_members: memberCount,
        max_members: team.max_members,
        open_roles: openRoles,
        required_skills: [...new Set(requiredSkills)],
      };
    });

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Search teams error:", error);
    return { success: false, data: [], error: "An unexpected error occurred." };
  }
}

export async function unifiedSearch(filters: SearchFilters): Promise<{ success: boolean; data: SearchResult; error?: string }> {
  try {
    const type = filters.type ?? "all";

    if (type === "people") {
      const usersResult = await searchUsers(filters);
      return { success: true, data: { users: usersResult.data, teams: [] } };
    }

    if (type === "teams") {
      const teamsResult = await searchTeams(filters);
      return { success: true, data: { users: [], teams: teamsResult.data } };
    }

    // Search both
    const [usersResult, teamsResult] = await Promise.all([
      searchUsers(filters),
      searchTeams(filters),
    ]);

    return {
      success: true,
      data: {
        users: usersResult.success ? usersResult.data : [],
        teams: teamsResult.success ? teamsResult.data : [],
      },
    };
  } catch (error) {
    console.error("Unified search error:", error);
    return { success: false, data: { users: [], teams: [] }, error: "An unexpected error occurred." };
  }
}