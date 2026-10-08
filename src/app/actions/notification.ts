"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export interface NotificationResult {
  success: boolean;
  error?: string;
}

export interface GetNotificationsResult {
  success: boolean;
  notifications: NotificationRow[];
  error?: string;
}

export async function getNotifications(): Promise<GetNotificationsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      notifications: [],
      error: "You must be signed in to view notifications.",
    };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load notifications:", error);

    return {
      success: false,
      notifications: [],
      error: "Unable to load notifications.",
    };
  }

  return {
    success: true,
    notifications: data ?? [],
  };
}

export async function markAsRead(
  notificationId: string,
): Promise<NotificationResult> {
  if (!notificationId || notificationId.trim().length === 0) {
    return {
      success: false,
      error: "Invalid notification ID.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be signed in to update notifications.",
    };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to mark notification as read:", error);

    return {
      success: false,
      error: "Unable to update notification.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Notification not found.",
    };
  }

  return {
    success: true,
  };
}
