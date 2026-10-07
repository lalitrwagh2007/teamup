import Link from "next/link";

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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Navbar from "@/components/layout/Navbar";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import TeamCard from "@/components/teams/TeamCard";
import ApplicationStatus from "@/components/applications/ApplicationStatus";

const MOCK_USER = {
  name: "Alex Johnson",
  avatarInitials: "AJ",
};

const PROFILE_PERCENTAGE = 75;

const RECOMMENDED_TEAMS = [
  {
    id: "1",
    name: "NovaByte",
    description: "AI-powered supply chain optimiser for last-mile delivery.",
    category: "AI / Machine Learning",
    skills: ["React", "Python", "Machine Learning"],
    currentMembers: 3,
    maxMembers: 5,
    mode: "Remote",
    location: "India",
  },
  {
    id: "2",
    name: "GreenGrid",
    description: "Climate-tech dashboard for tracking renewable energy usage.",
    category: "Web Development",
    skills: ["Vue.js", "Node.js", "D3"],
    currentMembers: 2,
    maxMembers: 5,
    mode: "Hybrid",
    location: "Pune",
  },
  {
    id: "3",
    name: "MedScan AI",
    description: "Diagnostic ML tools for resource-limited healthcare clinics.",
    category: "AI / Machine Learning",
    skills: ["PyTorch", "FastAPI", "React"],
    currentMembers: 2,
    maxMembers: 5,
    mode: "Remote",
    location: "India",
  },
];

const UPCOMING_OPPORTUNITIES = [
  {
    id: "1",
    title: "DevFest Global Hackathon",
    type: "Hackathon",
    typeColor: "bg-amber-50 text-amber-600",
    date: "Nov 12 – 14, 2026",
    teams: 340,
    daysLeft: 39,
  },
  {
    id: "2",
    title: "National Robotics Championship",
    type: "Competition",
    typeColor: "bg-blue-50 text-blue-600",
    date: "Dec 3 – 5, 2026",
    teams: 120,
    daysLeft: 60,
  },
  {
    id: "3",
    title: "Open Source Climate Sprint",
    type: "Community",
    typeColor: "bg-emerald-50 text-emerald-600",
    date: "Oct 25 – 26, 2026",
    teams: 85,
    daysLeft: 21,
  },
];

const MY_APPLICATIONS = [
  {
    id: "app1",
    teamName: "NovaByte",
    role: "Frontend Engineer",
    appliedAt: "2 days ago",
    status: "pending" as const,
  },
  {
    id: "app2",
    teamName: "QuantumLeap",
    role: "Programmer",
    appliedAt: "5 days ago",
    status: "pending" as const,
  },
  {
    id: "app3",
    teamName: "CityHelp",
    role: "Community Lead",
    appliedAt: "1 week ago",
    status: "accepted" as const,
  },
];

const MY_TEAMS = [
  {
    id: "t1",
    name: "OpenCommons",
    role: "Admin",
    members: 3,
    category: "Community",
    categoryColor: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "t2",
    name: "EduBlocks",
    role: "Member",
    members: 4,
    category: "Student Project",
    categoryColor: "bg-purple-50 text-purple-700",
  },
];

const STAT_CARDS = [
  {
    label: "My Teams",
    value: MY_TEAMS.length,
    icon: Users,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    href: "/my-teams",
  },
  {
    label: "Applications",
    value: MY_APPLICATIONS.length,
    icon: Briefcase,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    href: "/applications",
  },
  {
    label: "Opportunities",
    value: UPCOMING_OPPORTUNITIES.length,
    icon: CalendarDays,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    href: "/opportunities",
  },
  {
    label: "Matches",
    value: 12,
    icon: Zap,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    href: "/teams",
  },
];

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

export default function DashboardPage() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting},{" "}
              <span className="text-indigo-600">
                {MOCK_USER.name.split(" ")[0]}
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
                {RECOMMENDED_TEAMS.map((team) => (
                  <TeamCard
                    key={team.id}
                    id={team.id}
                    name={team.name}
                    description={team.description}
                    category={team.category}
                    currentMembers={team.currentMembers}
                    maxMembers={team.maxMembers}
                    skills={team.skills}
                    mode={team.mode}
                    location={team.location}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeader
                title="Upcoming opportunities"
                href="/opportunities"
              />

              <div className="flex flex-col gap-3">
                {UPCOMING_OPPORTUNITIES.map((opp) => (
                  <Card
                    key={opp.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/20 ${opp.typeColor}`}
                          >
                            {opp.type}
                          </span>

                          {opp.daysLeft <= 30 && (
                            <Badge variant="destructive" className="text-xs">
                              {opp.daysLeft}d left
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 truncate font-semibold">
                          {opp.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          <CalendarDays className="mr-1 inline size-3.5" />
                          {opp.date} · {opp.teams} teams registered
                        </p>
                      </div>

                      <Link href={`/opportunities/${opp.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 rounded-lg"
                        >
                          View
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <SectionHeader title="My applications" href="/applications" />

              <div className="flex flex-col gap-2">
                {MY_APPLICATIONS.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {app.teamName}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {app.role} · {app.appliedAt}
                      </p>
                    </div>

                    <ApplicationStatus status={app.status} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <ProfileCompletion percentage={PROFILE_PERCENTAGE} />

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
                {MY_TEAMS.map((team) => (
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
                          {team.members} members
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/20 ${team.categoryColor}`}
                      >
                        {team.category}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {team.role}
                      </span>
                    </div>
                  </Link>
                ))}

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
                    label: "Opportunities",
                    icon: CalendarDays,
                    href: "/opportunities",
                  },
                  {
                    label: "My profile",
                    icon: Users,
                    href: "/profile",
                  },
                  {
                    label: "Applications",
                    icon: Briefcase,
                    href: "/applications",
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
