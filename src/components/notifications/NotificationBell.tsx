"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { getNotifications } from "@/app/actions/notification";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const NOTIFICATIONS_UPDATED_EVENT = "teamup:notifications-updated";
const NOTIFICATION_INSERTED_EVENT = "teamup:notification-inserted";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadNotifications = async () => {
      const result = await getNotifications();

      if (!mounted || !result.success) {
        return;
      }

      setUnreadCount(
        result.notifications.filter((notification) => !notification.read)
          .length,
      );
    };

    const subscribeToUserNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as Notification;

            if (notification.user_id !== user.id) {
              return;
            }

            setUnreadCount((current) =>
              notification.read ? current : current + 1,
            );

            window.dispatchEvent(
              new CustomEvent<Notification>(NOTIFICATION_INSERTED_EVENT, {
                detail: notification,
              }),
            );
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn("Notification Realtime subscription unavailable.");
          }
        });
    };

    const handleUpdated = () => {
      void loadNotifications();
    };

    void loadNotifications();
    void subscribeToUserNotifications();

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadNotifications();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();

      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Bell className="size-5" />

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-4 text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
