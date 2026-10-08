
import { notFound } from "next/navigation";
import { Briefcase, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import SkillTags from "@/components/profile/SkillTags";
import TeamCapacity from "@/components/teams/TeamCapacity";
import CopyInviteLink from "@/components/teams/CopyInviteLink";

const teams = [
  {
    id: "1",
    name: "AI Builders",
    description:
      "A team focused on building practical AI tools and experimenting with modern machine learning technologies.",
    category: "AI / Machine Learning",
    opportunityName: "AI Productivity Assistant",
    skills: ["Python", "Next.js", "OpenAI", "Machine Learning"],
    currentMembers: 4,
    maxMembers: 6,
    mode: "Remote",
    location: "India",
    members: [
      {
        id: "m1",
        name: "Aarav",
        role: "Team Lead",
      },
      {
        id: "m2",
        name: "Priya",
        role: "Frontend Developer",
      },
      {
        id: "m3",
        name: "Rohan",
        role: "AI Engineer",
      },
      {
        id: "m4",
        name: "Neha",
        role: "Product Designer",
      },
    ],
    openRoles: [
      {
        id: "r1",
        title: "Backend Developer",
        description:
          "Help build APIs and integrate AI services into the application.",
      },
      {
        id: "r2",
        title: "ML Engineer",
        description:
          "Work on prompts, model integrations, evaluations and AI features.",
      },
    ],
  },
  {
    id: "2",
    name: "Web Innovators",
    description:
      "Frontend and backend developers collaborating on modern web applications and developer tools.",
    category: "Web Development",
    opportunityName: "Developer Collaboration Platform",
    skills: ["React", "TypeScript", "Node.js"],
    currentMembers: 3,
    maxMembers: 5,
    mode: "Hybrid",
    location: "Pune",
    members: [
      {
        id: "m1",
        name: "Rahul",
        role: "Team Lead",
      },
      {
        id: "m2",
        name: "Ananya",
        role: "Frontend Developer",
      },
      {
        id: "m3",
        name: "Karan",
        role: "Backend Developer",
      },
    ],
    openRoles: [
      {
        id: "r1",
        title: "UI/UX Designer",
        description:
          "Design intuitive interfaces and improve the product experience.",
      },
      {
        id: "r2",
        title: "Full Stack Developer",
        description: "Help develop frontend features and backend APIs.",
      },
    ],
  },
];

interface TeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;

  const team = teams.find((item) => item.id === id);

  if (!team) {
    notFound();
  }

  const inviteUrl = `http://localhost:3000/teams/${team.id}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{team.category}</Badge>

          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            {team.mode}
          </span>

          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {team.location}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {team.name}
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          {team.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Opportunity */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-lg font-medium">{team.opportunityName}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>

            <CardContent>
              <SkillTags skills={team.skills} />
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {team.members.map((member) => (
                  <div key={member.id} className="rounded-lg border p-4">
                    <p className="font-medium">{member.name}</p>

                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open roles */}
          <Card>
            <CardHeader>
              <CardTitle>Open Roles</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {team.openRoles.length > 0 ? (
                team.openRoles.map((role) => (
                  <div key={role.id} className="rounded-lg border p-4">
                    <h3 className="font-semibold">{role.title}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  There are currently no open roles.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Capacity</CardTitle>
            </CardHeader>

            <CardContent>
              <TeamCapacity
                currentMembers={team.currentMembers}
                maxMembers={team.maxMembers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join this team</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button className="w-full">Apply to Join</Button>

              <CopyInviteLink inviteUrl={inviteUrl} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
