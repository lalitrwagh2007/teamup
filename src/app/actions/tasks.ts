"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TaskStatus = "todo" | "doing" | "done";

export type TeamTask = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_role_id: string | null;
  assigned_member_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TaskActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireTeamMember(teamId: string): Promise<TaskActionResult<{ supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string } }>> {
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

export async function getTeamTasks(teamId: string): Promise<TaskActionResult<TeamTask[]>> {
  const membershipResult = await requireTeamMember(teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase } = membershipResult.data;

  const { data, error } = await supabase
    .from("team_tasks")
    .select(
      "id, team_id, title, description, status, assigned_role_id, assigned_member_id, created_by, created_at, updated_at"
    )
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Failed to load team tasks." };
  }

  return { success: true, data: (data ?? []) as TeamTask[] };
}

export async function createTeamTask(input: {
  teamId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  assignedRoleId?: string | null;
  assignedMemberId?: string | null;
}): Promise<TaskActionResult<TeamTask>> {
  const membershipResult = await requireTeamMember(input.teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase, user } = membershipResult.data;

  const title = input.title.trim();

  if (!title) {
    return { success: false, error: "Task title is required." };
  }

  if (title.length > 120) {
    return { success: false, error: "Task title must be 120 characters or fewer." };
  }

  if (input.description && input.description.length > 1000) {
    return { success: false, error: "Task description must be 1000 characters or fewer." };
  }

  const { data, error } = await supabase
    .from("team_tasks")
    .insert({
      team_id: input.teamId,
      title,
      description: input.description?.trim() || null,
      status: input.status ?? "todo",
      assigned_role_id: input.assignedRoleId || null,
      assigned_member_id: input.assignedMemberId || null,
      created_by: user.id,
    })
    .select(
      "id, team_id, title, description, status, assigned_role_id, assigned_member_id, created_by, created_at, updated_at"
    )
    .single();

  if (error) {
    return { success: false, error: "Failed to create task." };
  }

  revalidatePath(`/teams/${input.teamId}/workspace`);

  return { success: true, data: data as TeamTask };
}

export async function updateTeamTask(input: {
  taskId: string;
  teamId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedRoleId?: string | null;
  assignedMemberId?: string | null;
}): Promise<TaskActionResult<TeamTask>> {
  const membershipResult = await requireTeamMember(input.teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase } = membershipResult.data;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) {
      return { success: false, error: "Task title is required." };
    }

    if (title.length > 120) {
      return { success: false, error: "Task title must be 120 characters or fewer." };
    }

    updates.title = title;
  }

  if (input.description !== undefined) {
    if (input.description.length > 1000) {
      return { success: false, error: "Task description must be 1000 characters or fewer." };
    }

    updates.description = input.description.trim() || null;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (input.assignedRoleId !== undefined) {
    updates.assigned_role_id = input.assignedRoleId || null;
  }

  if (input.assignedMemberId !== undefined) {
    updates.assigned_member_id = input.assignedMemberId || null;
  }

  const { data, error } = await supabase
    .from("team_tasks")
    .update(updates)
    .eq("id", input.taskId)
    .eq("team_id", input.teamId)
    .select(
      "id, team_id, title, description, status, assigned_role_id, assigned_member_id, created_by, created_at, updated_at"
    )
    .single();

  if (error) {
    return { success: false, error: "Failed to update task." };
  }

  revalidatePath(`/teams/${input.teamId}/workspace`);

  return { success: true, data: data as TeamTask };
}

export async function deleteTeamTask(input: {
  taskId: string;
  teamId: string;
}): Promise<TaskActionResult<void>> {
  const membershipResult = await requireTeamMember(input.teamId);

  if (!membershipResult.success) {
    return { success: false, error: membershipResult.error };
  }

  const { supabase } = membershipResult.data;

  const { error } = await supabase
    .from("team_tasks")
    .delete()
    .eq("id", input.taskId)
    .eq("team_id", input.teamId);

  if (error) {
    return { success: false, error: "Failed to delete task." };
  }

  revalidatePath(`/teams/${input.teamId}/workspace`);

  return { success: true, data: undefined };
}