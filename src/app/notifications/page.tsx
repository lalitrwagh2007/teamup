import { getNotifications } from "@/app/actions/notification";
import NotificationsList from "@/components/notifications/NotificationsList";

export default async function NotificationsPage() {
  const result = await getNotifications();

  if (!result.success) {
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

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {result.error ?? "Unable to load notifications."}
        </div>
      </main>
    );
  }

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

      <NotificationsList initialNotifications={result.notifications} />
    </main>
  );
}
