import type { Application } from "@/app/actions/application";

interface ApplicationsListProps {
  applications: Application[];
}

function getStatusStyles(status: Application["status"]) {
  switch (status) {
    case "accepted":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "rejected":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "withdrawn":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";

    case "pending":
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }
}

function formatStatus(status: Application["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function ApplicationsList({
  applications,
}: ApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <span className="text-xl text-zinc-400">⌁</span>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          No applications yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          When you apply to a team, your applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <article
          key={application.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.045]"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400">
                  Application
                </span>

                <span
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                    application.status,
                  )}`}
                >
                  {formatStatus(application.status)}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-white">
                Team Application
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Submitted on {formatDate(application.created_at)}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Role
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-300">
                {application.role_id}
              </p>
            </div>
          </div>

          {application.message && (
            <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Your message
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                {application.message}
              </p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}