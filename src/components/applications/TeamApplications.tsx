"use client";

import { useState } from "react";
import {
  acceptApplication,
  rejectApplication,
  type Application,
} from "@/app/actions/application";

interface TeamApplicationsProps {
  applications: Application[];
}

export default function TeamApplications({
  applications: initialApplications,
}: TeamApplicationsProps) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (
    applicationId: string,
    action: "accept" | "reject",
  ) => {
    if (loadingId) return;

    setLoadingId(applicationId);

    try {
      const result =
        action === "accept"
          ? await acceptApplication(applicationId)
          : await rejectApplication(applicationId);

      if (!result.success) {
        window.alert(result.error ?? "Unable to update application.");
        return;
      }

      if (result.data) {
        setApplications((current) =>
          current.map((application) =>
            application.id === applicationId
              ? result.data!
              : application,
          ),
        );
      }
    } catch (error) {
      console.error("Application management error:", error);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-lg font-semibold text-white">
          Team Applications
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          No applications have been submitted to this team yet.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Team Applications
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Review and manage people who want to join your team.
        </p>
      </div>

      <div className="space-y-3">
        {applications.map((application) => {
          const isPending = application.status === "pending";
          const isLoading = loadingId === application.id;

          return (
            <article
              key={application.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                      Applicant
                    </span>

                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize text-zinc-400">
                      {application.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-zinc-400">
                    Applicant ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-white">
                    {application.applicant_id}
                  </p>

                  <p className="mt-3 text-sm text-zinc-400">
                    Role ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-white">
                    {application.role_id}
                  </p>
                </div>

                {isPending && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleAction(application.id, "reject")
                      }
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Reject"}
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleAction(application.id, "accept")
                      }
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Updating..." : "Accept"}
                    </button>
                  </div>
                )}
              </div>

              {application.message && (
                <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                    {application.message}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}