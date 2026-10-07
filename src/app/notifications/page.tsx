"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus, Users, Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type NotificationType = "accepted" | "invitation" | "capacity" | "applicant";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "accepted",
    message: "Your application to AI Builders has been accepted.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "invitation",
    message: "You received an invitation to join Web Innovators.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "capacity",
    message: "Design Collective has reached full team capacity.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "applicant",
    message: "A new applicant joined your Mobile Makers team.",
    time: "Yesterday",
    read: true,
  },
];

function NotificationIcon({ type }: { type: NotificationType }) {
  const className = "h-5 w-5";

  switch (type) {
    case "accepted":
      return <CheckCircle2 className={className} />;

    case "invitation":
      return <Mail className={className} />;

    case "capacity":
      return <Users className={className} />;

    case "applicant":
      return <UserPlus className={className} />;

    default:
      return null;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Notifications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Stay updated on your teams, applications, and invitations.
        </p>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => markAsRead(notification.id)}
              className={`cursor-pointer transition-colors ${
                notification.read
                  ? "bg-background"
                  : "border-primary/20 bg-muted/40"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <NotificationIcon type={notification.type} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-sm sm:text-base ${
                        notification.read ? "font-normal" : "font-semibold"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {!notification.read && (
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {notification.time}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No notifications</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      )}
    </main>
  );
}
