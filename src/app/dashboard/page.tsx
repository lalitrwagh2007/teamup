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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import type { ProfileCompletionStep } from "@/components/profile/ProfileCompletion";
import TeamCard from "@/components/teams/TeamCard";
import type { TeamCardData } from "@/components/teams/TeamCard";
import ApplicationStatus from "@/components/applications/ApplicationStatus";
import type { ApplicationData } from "@/components/applications/ApplicationStatus";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: "Alex Johnson",
  avatarInitials: "AJ",
};

const PROFILE_STEPS: ProfileCompletionStep[] = [
  { label: "Add your photo", done: true, href: "/profile/edit" },
  { label: "Write a bio", done: true, href: "/profile/edit#bio" },
  { label: "Add your skills", done: false, href: "/profile/edit#skills" },
  { label: "Link your GitHub", done: false, href: "/profile/edit#links" },
  { label: "Verify your email", done: true, href: "/settings" },
];

const PROFILE_PERCENTAGE = Math.round(
  (PROFILE_STEPS.filter((s) => s.done).length / PROFILE_STEPS.length) * 100
);

const RECOMMENDED_TEAMS: TeamCardData[] = [
  {
    id: "1",
    name: "NovaByte",
    tagline: "AI-powered supply chain optimiser for last-mile delivery",
    category: "Hackathon",
    categoryColor: "bg-amber-50 text-amber-600",
    skills: ["React", "Python", "ML"],
    members: [
      { name: "Alice" },
      { name: "Bob" },
      { name: "Carol" },
    ],
    spotsLeft: 2,
    totalSpots: 5,
    rating: 4.8,
  },
  {
    id: "2",
    name: "GreenGrid",
    tagline: "Climate-tech dashboard for tracking renewable energy usage",
    category: "Student Project",
    categoryColor: "bg-purple-50 text-purple-600",
    skills: ["Vue.js", "Node", "D3"],
    members: [{ name: "David" }, { name: "Eva" }],
    spotsLeft: 3,
    totalSpots: 5,
    rating: 4.6,
  },
  {
    id: "3",
    name: "MedScan AI",
    tagline: "Diagnostic ML tools for resource-limited healthcare clinics",
    category: "Tech & AI",
    categoryColor: "bg-cyan-50 text-cyan-600",
    skills: ["PyTorch", "FastAPI", "React"],
    members: [{ name: "Olivia" }, { name: "Priya" }],
    spotsLeft: 3,
    totalSpots: 5,
    rating: 4.9,
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

const MY_APPLICATIONS: ApplicationData[] = [
  {
    id: "app1",
    teamName: "NovaByte",
    role: "Frontend Engineer",
    appliedAt: "2 days ago",
    status: "reviewing",
  },
  {
    id: "app2",
    teamName: "QuantumLeap",
    role: "Programmer",
    appliedAt: "5 days ago",
    status: "pending",
  },
  {
    id: "app3",
    teamName: "CityHelp",
    role: "Community Lead",
    appliedAt: "1 week ago",
    status: "accepted",
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

// ─── Section header helper ────────────────────────────────────────────────────

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
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Welcome bar ────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting},{" "}
              <span className="text-indigo-600">{MOCK_USER.name.split(" ")[0]}</span>{" "}
              👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's what's happening with your teams today.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
              <Search className="size-4" />
              <Link href="/teams">Explore</Link>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              <Link href="/teams/create">New team</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="rounded-lg"
            >
              <Bell className="size-5" />
            </Button>
          </div>
        </div>

        {/* ── Stat cards row ──────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor, href }) => (
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
          ))}
        </div>

        {/* ── Main grid ────────────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left column (2/3) ── */}
          <div className="flex flex-col gap-8 lg:col-span-2">

            {/* Recommended teams */}
            <section className="flex flex-col gap-4">
              <SectionHeader title="Recommended teams" href="/teams" linkLabel="See all" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {RECOMMENDED_TEAMS.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </section>

            {/* Upcoming opportunities */}
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 rounded-lg"
                      >
                        <Link href={`/opportunities/${opp.id}`}>
                          View
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* My applications */}
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="My applications"
                href="/applications"
              />
              <div className="flex flex-col gap-2">
                {MY_APPLICATIONS.map((app) => (
                  <ApplicationStatus key={app.id} application={app} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="flex flex-col gap-6">

            {/* Profile completion */}
            <ProfileCompletion
              percentage={PROFILE_PERCENTAGE}
              steps={PROFILE_STEPS}
            />

            {/* My teams */}
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
                      {/* Team avatar */}
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

                {/* Create team CTA */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full gap-1.5 rounded-lg"
                >
                  <Plus className="size-4" />
                  <Link href="/teams/create">Create a new team</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick action panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Quick actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { label: "Find a team", icon: Search, href: "/teams" },
                  { label: "Opportunities", icon: CalendarDays, href: "/opportunities" },
                  { label: "My profile", icon: Users, href: "/profile" },
                  { label: "Applications", icon: Briefcase, href: "/applications" },
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
