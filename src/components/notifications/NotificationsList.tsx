"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, CheckCircle2, Mail, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import {
  acceptApplication,
  rejectApplication,
} from "@/app/actions/application";
import {
  markAsRead,
  type NotificationResult,
} from "@/app/actions/notification";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Database } from "@/types/database";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const NOTIFICATIONS_UPDATED_EVENT = "teamup:notifications-updated";

const NOTIFICATION_INSERTED_EVENT = "teamup:notification-inserted";

interface NotificationsListProps {
  initialNotifications: Notification[];
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "application_accepted":
      return <CheckCircle2 className="size-5" />;

    case "application_received":
      return <UserPlus className="size-5" />;

    case "application_rejected":
      return <Bell className="size-5" />;

    case "invitation":
      return <Mail className="size-5" />;

    case "capacity":
      return <Users className="size-5" />;

    default:
      return <Bell className="size-5" />;
  }
}

function formatNotificationDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getApplicationId(data: Notification["data"]): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const applicationId = record.application_id;

  return typeof applicationId === "string" ? applicationId : null;
}

function getApplicationStatus(data: Notification["data"]): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const status = record.application_status;

  return typeof status === "string" ? status : null;
}

export default function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [isPending, startTransition] = useTransition();

  const [applicationLoadingId, setApplicationLoadingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const handleNotificationInserted = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;

      const incoming = customEvent.detail;

      if (!incoming) {
        return;
      }

      setNotifications((current) => {
        if (current.some((notification) => notification.id === incoming.id)) {
          return current;
        }

        return [incoming, ...current];
      });
    };

    window.addEventListener(
      NOTIFICATION_INSERTED_EVENT,
      handleNotificationInserted,
    );

    return () => {
      window.removeEventListener(
        NOTIFICATION_INSERTED_EVENT,
        handleNotificationInserted,
      );
    };
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    const notification = notifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification || notification.read || isPending) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );

    startTransition(async () => {
      const result: NotificationResult = await markAsRead(notificationId);

      if (!result.success) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  read: false,
                }
              : item,
          ),
        );

        toast.error(result.error ?? "Unable to mark notification as read.");

        return;
      }

      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    });
  };

  const handleApplicationAction = async (
    notification: Notification,
    action: "accept" | "reject",
  ) => {
    const applicationId = getApplicationId(notification.data);

    if (!applicationId) {
      toast.error("Application information is missing.");
      return;
    }

    if (applicationLoadingId) {
      return;
    }

    setApplicationLoadingId(applicationId);

    try {
      const result =
        action === "accept"
          ? await acceptApplication(applicationId)
          : await rejectApplication(applicationId);

      if (!result.success) {
        toast.error(result.error ?? `Unable to ${action} application.`);
        return;
      }

      toast.success(
        action === "accept"
          ? "Application accepted. Applicant added to the team."
          : "Application rejected.",
      );

      /*
       * Update the notification locally so the
       * Accept / Reject buttons disappear after action.
       */
      setNotifications((current) =>
        current.map((item) => {
          if (item.id !== notification.id) {
            return item;
          }

          const currentData =
            item.data &&
            typeof item.data === "object" &&
            !Array.isArray(item.data)
              ? (item.data as Record<string, unknown>)
              : {};

          return {
            ...item,
            read: true,
            data: {
              ...currentData,
              application_status: action === "accept" ? "accepted" : "rejected",
            },
          } as Notification;
        }),
      );

      if (!notification.read) {
        const readResult = await markAsRead(notification.id);

        if (!readResult.success) {
          console.error(
            "Unable to mark notification as read:",
            readResult.error,
          );
        }
      }

      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (error) {
      console.error("Application action failed:", error);

      toast.error("Something went wrong while updating the application.");
    } finally {
      setApplicationLoadingId(null);
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <Bell className="size-8 text-muted-foreground" />

          <div>
            <p className="font-medium">No notifications yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const applicationId = getApplicationId(notification.data);

        const applicationStatus = getApplicationStatus(notification.data);

        const isApplicationLoading =
          applicationId !== null && applicationLoadingId === applicationId;

        const showApplicationActions =
          notification.type === "application_received" &&
          applicationId !== null &&
          applicationStatus !== "accepted" &&
          applicationStatus !== "rejected";

        return (
          <Card
            key={notification.id}
            role={!notification.read ? "button" : undefined}
            tabIndex={!notification.read ? 0 : undefined}
            onClick={() => handleMarkAsRead(notification.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                handleMarkAsRead(notification.id);
              }
            }}
            className={
              !notification.read
                ? "cursor-pointer border-indigo-200 bg-indigo-50/50 transition-colors hover:bg-indigo-50"
                : "cursor-default"
            }
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{notification.title}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>

                    {showApplicationActions && (
                      <div
                        className="mt-4 flex flex-wrap gap-2"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isApplicationLoading}
                          onClick={() =>
                            handleApplicationAction(notification, "reject")
                          }
                        >
                          {isApplicationLoading ? "Updating..." : "Reject"}
                        </Button>

                        <Button
                          type="button"
                          disabled={isApplicationLoading}
                          onClick={() =>
                            handleApplicationAction(notification, "accept")
                          }
                        >
                          {isApplicationLoading ? "Updating..." : "Accept"}
                        </Button>
                      </div>
                    )}

                    {applicationStatus === "accepted" && (
                      <p className="mt-3 text-sm font-medium text-emerald-600">
                        Application accepted.
                      </p>
                    )}

                    {applicationStatus === "rejected" && (
                      <p className="mt-3 text-sm font-medium text-red-600">
                        Application rejected.
                      </p>
                    )}
                  </div>

                  {!notification.read && (
                    <span
                      className="mt-1 size-2 shrink-0 rounded-full bg-indigo-600"
                      aria-label="Unread"
                    />
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {formatNotificationDate(notification.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
