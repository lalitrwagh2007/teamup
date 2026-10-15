import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  Plus,
  Search,
  Users,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Navbar from "@/components/layout/Navbar";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import TeamCard from "@/components/teams/TeamCard";
import ApplicationStatus from "@/components/applications/ApplicationStatus";

import {
  getCurrentProfile,
} from "@/app/actions/profile";

import {
  getMyApplications,
} from "@/app/actions/application";

import {
  getMyTeams,
  getTeams,
} from "@/app/actions/team";

import type { TeamRecord } from "@/types/team";

interface TeamWithMembers extends TeamRecord {
  currentMembers: number;
}

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
      >
        {linkLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

async function getDashboardData() {
  const [profileResult, applicationsResult, myTeamsResult, allTeamsResult] =
    await Promise.all([
      getCurrentProfile(),
      getMyApplications(),
      getMyTeams(),
      getTeams(),
    ]);

  return {
    profile: profileResult.success ? profileResult.profile : null,
    applications: applicationsResult.success ? (applicationsResult.data ?? []) : [],
    myTeams: myTeamsResult.success ? (myTeamsResult.data ?? []) : [],
    allTeams: allTeamsResult.success ? allTeamsResult.data : [],
  };
}

export default async function DashboardPage() {
  const { profile, applications, myTeams, allTeams } = await getDashboardData();

  if (!profile) {
    redirect("/onboarding");
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = profile.name?.split(" ")[0] ?? "there";

  const myApplicationsCount = applications?.length ?? 0;
  const myTeamsCount = myTeams.length;
  const opportunitiesCount = 0;
  const matchesCount = 0;

  const userTeams = myTeams as TeamWithMembers[];
  const recommendedTeams = allTeams.filter((t) => !userTeams.some((ut) => ut.id === t.id)).slice(0, 6);

  const STAT_CARDS = [
    {
      label: "My Teams",
      value: myTeamsCount,
      icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      href: "/my-teams",
    },
    {
      label: "Applications",
      value: myApplicationsCount,
      icon: Briefcase,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/applications",
    },
    {
      label: "Opportunities",
      value: opportunitiesCount,
      icon: CalendarDays,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/teams?view=opportunities",
    },
    {
      label: "Matches",
      value: matchesCount,
      icon: Zap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/teams",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting},{" "}
              <span className="text-indigo-600">
                {firstName}
              </span>{" "}
              👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening with your teams today.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/teams">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg"
              >
                <Search className="size-4" />
                Explore
              </Button>
            </Link>

            <Link href="/create-team">
              <Button
                size="sm"
                className="gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="size-4" />
                New team
              </Button>
            </Link>

            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="rounded-lg"
              >
                <Bell className="size-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(
            ({ label, value, icon: Icon, iconBg, iconColor, href }) => (
              <Link key={label} href={href}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 pt-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                    >
                      <Icon className={`size-5 ${iconColor}`} />
                    </span>

                    <div>
                      <p className="text-2xl font-bold">{value}</p>

                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ),
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="Recommended teams"
                href="/teams"
                linkLabel="See all"
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {recommendedTeams.length > 0 ? (
                  recommendedTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      id={team.id}
                      name={team.name}
                      description={team.description ?? ""}
                      category={team.category ?? "General"}
                      currentMembers={1}
                      maxMembers={team.maxMembers}
                      skills={[]}
                      mode={team.mode ?? "Remote"}
                      location={team.location ?? "Not specified"}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                    No teams to recommend yet. <Link href="/create-team" className="text-indigo-600 hover:underline">Create one</Link>!
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeader title="My applications" href="/applications" />

              <div className="flex flex-col gap-2">
                {applications?.length > 0 ? (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {app.team?.name ?? "Unknown Team"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {app.role?.title ?? "Unknown Role"} · {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <ApplicationStatus status={app.status} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                    No applications yet. <Link href="/teams" className="text-indigo-600 hover:underline">Explore teams</Link> to apply!
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <ProfileCompletion percentage={profile.profileCompletion} />

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    My teams
                  </CardTitle>

                  <Link
                    href="/my-teams"
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {userTeams.length > 0 ? (
                  userTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                          {team.name.charAt(0)}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {team.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {team.currentMembers ?? 1} / {team.maxMembers} members
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/20 bg-emerald-50 text-emerald-700">
                          {team.track === "technical" ? "Technical" : "Community"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          Owner
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t own any teams yet.
                  </p>
                )}

                <Link href="/create-team">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-full gap-1.5 rounded-lg"
                  >
                    <Plus className="size-4" />
                    Create a new team
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Quick actions
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Find a team",
                    icon: Search,
                    href: "/teams",
                  },
                  {
                    label: "My applications",
                    icon: Briefcase,
                    href: "/applications",
                  },
                  {
                    label: "My profile",
                    icon: Users,
                    href: "/profile",
                  },
                  {
                    label: "Notifications",
                    icon: Bell,
                    href: "/notifications",
                  },
                ].map(({ label, icon: Icon, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}