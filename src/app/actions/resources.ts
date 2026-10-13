"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ResourceType = "GitHub" | "Figma" | "Google Docs" | "Other";

export type TeamResource = {
  id: string;
  team_id: string;
  title: string;
  url: string;
  type: ResourceType;
  created_by: string;
  created_at: string;
};

export type ResourceActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const resourceSchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
  type: z.enum(["GitHub", "Figma", "Google Docs", "Other"]),
});

async function requireTeamMember(teamId: string): Promise<ResourceActionResult<{ supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string } }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: membership, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    return { success: false, error: "You are not a member of this team." };
  }

  return { success: true, data: { supabase, user } };
}

export async function getTeamResources(
  teamId: string
): Promise<ResourceActionResult<TeamResource[]>> {
  const membershipResult = await requireTeamMember(teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase } = membershipResult.data;

  const { data, error } = await supabase
    .from("team_resources")
    .select("id, team_id, title, url, type, created_by, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Failed to load team resources." };
  }

  return { success: true, data: (data ?? []) as TeamResource[] };
}

export async function createTeamResource(input: {
  teamId: string;
  title: string;
  url: string;
  type: ResourceType;
}): Promise<ResourceActionResult<TeamResource>> {
  const parsed = resourceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Please provide a valid title, URL, and resource type." };
  }

  const membershipResult = await requireTeamMember(parsed.data.teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase, user } = membershipResult.data;

  const { data, error } = await supabase
    .from("team_resources")
    .insert({
      team_id: parsed.data.teamId,
      title: parsed.data.title,
      url: parsed.data.url,
      type: parsed.data.type,
      created_by: user.id,
    })
    .select("id, team_id, title, url, type, created_by, created_at")
    .single();

  if (error) {
    return { success: false, error: "Failed to create resource." };
  }

  revalidatePath(`/teams/${parsed.data.teamId}/workspace`);

  return { success: true, data: data as TeamResource };
}

export async function deleteTeamResource(input: {
  resourceId: string;
  teamId: string;
}): Promise<ResourceActionResult<void>> {
  const teamIdSchema = z.string().uuid();
  const resourceIdSchema = z.string().uuid();

  if (
    !teamIdSchema.safeParse(input.teamId).success ||
    !resourceIdSchema.safeParse(input.resourceId).success
  ) {
    return { success: false, error: "Invalid resource details." };
  }

  const membershipResult = await requireTeamMember(input.teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase } = membershipResult.data;

  const { error } = await supabase
    .from("team_resources")
    .delete()
    .eq("id", input.resourceId)
    .eq("team_id", input.teamId);

  if (error) {
    return { success: false, error: "Failed to delete resource." };
  }

  revalidatePath(`/teams/${input.teamId}/workspace`);

  return { success: true, data: undefined };
}