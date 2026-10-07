"use client";

import { useMemo, useState } from "react";

import ApplicationCard from "@/components/applications/ApplicationCard";
import type { ApplicationStatusType } from "@/components/applications/ApplicationStatus";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | ApplicationStatusType;

const applications = [
  {
    id: "1",
    teamName: "AI Builders",
    role: "ML Engineer",
    appliedDate: "Oct 5, 2026",
    status: "pending" as ApplicationStatusType,
    matchPercentage: 92,
  },
  {
    id: "2",
    teamName: "Web Innovators",
    role: "Frontend Developer",
    appliedDate: "Oct 2, 2026",
    status: "accepted" as ApplicationStatusType,
    matchPercentage: 88,
  },
  {
    id: "3",
    teamName: "Cloud Crew",
    role: "DevOps Engineer",
    appliedDate: "Sep 28, 2026",
    status: "rejected" as ApplicationStatusType,
    matchPercentage: 74,
  },
  {
    id: "4",
    teamName: "Design Collective",
    role: "UI Developer",
    appliedDate: "Sep 20, 2026",
    status: "withdrawn" as ApplicationStatusType,
    matchPercentage: 81,
  },
];

const filters: {
  label: string;
  value: StatusFilter;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Accepted",
    value: "accepted",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Withdrawn",
    value: "withdrawn",
  },
];

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") {
      return applications;
    }

    return applications.filter(
      (application) => application.status === statusFilter,
    );
  }, [statusFilter]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          My Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track the teams you have applied to and view your current application
          status.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            size="sm"
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {filteredApplications.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              teamName={application.teamName}
              role={application.role}
              appliedDate={application.appliedDate}
              status={application.status}
              matchPercentage={application.matchPercentage}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No applications found</h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            You do not have any applications with this status yet.
          </p>
        </div>
      )}
    </main>
  );
}
