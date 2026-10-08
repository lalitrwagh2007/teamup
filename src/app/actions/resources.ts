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

const resourceSchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
  type: z.enum(["GitHub", "Figma", "Google Docs", "Other"]),
});

async function requireTeamMember(teamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: membership, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    throw new Error("You are not a member of this team.");
  }

  return { supabase, user };
}

export async function getTeamResources(
  teamId: string
): Promise<TeamResource[]> {
  const { supabase } = await requireTeamMember(teamId);

  const { data, error } = await supabase
    .from("team_resources")
    .select("id, team_id, title, url, type, created_by, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load team resources.");
  }

  return (data ?? []) as TeamResource[];
}

export async function createTeamResource(input: {
  teamId: string;
  title: string;
  url: string;
  type: ResourceType;
}) {
  const parsed = resourceSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Please provide a valid title, URL, and resource type.");
  }

  const { supabase, user } = await requireTeamMember(parsed.data.teamId);

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
    throw new Error("Failed to create resource.");
  }

  revalidatePath(`/teams/${parsed.data.teamId}/workspace`);

  return {
    success: true,
    resource: data as TeamResource,
  };
}

export async function deleteTeamResource(input: {
  resourceId: string;
  teamId: string;
}) {
  const teamIdSchema = z.string().uuid();
  const resourceIdSchema = z.string().uuid();

  if (
    !teamIdSchema.safeParse(input.teamId).success ||
    !resourceIdSchema.safeParse(input.resourceId).success
  ) {
    throw new Error("Invalid resource details.");
  }

  const { supabase } = await requireTeamMember(input.teamId);

  const { error } = await supabase
    .from("team_resources")
    .delete()
    .eq("id", input.resourceId)
    .eq("team_id", input.teamId);

  if (error) {
    throw new Error("Failed to delete resource.");
  }

  revalidatePath(`/teams/${input.teamId}/workspace`);

  return {
    success: true,
  };
}
