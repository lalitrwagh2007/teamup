"use client";

import { Globe, Users, Link2, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMemberContact {
  id: string;
  userId: string;
  memberRole: string;
  joinedAt: string | null;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    github: string | null;
    linkedin: string | null;
    portfolio: string | null;
  } | null;
}

interface TeamMemberContactsProps {
  members: TeamMemberContact[];
}

export default function TeamMemberContacts({ members }: TeamMemberContactsProps) {
  const membersWithLinks = members.filter(
    (m) => m.profile && (m.profile.github || m.profile.linkedin || m.profile.portfolio),
  );

  if (membersWithLinks.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground py-8">
          No team members have added professional links yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Member Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {membersWithLinks.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                {member.profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-medium">
                  {member.profile?.full_name ?? "Team Member"}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.memberRole}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {member.profile?.github && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  render={
                    <a
                      href={member.profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <GitBranch className="size-3.5" />
                  GitHub
                </Button>
              )}

              {member.profile?.linkedin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  render={
                    <a
                      href={member.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Link2 className="size-3.5" />
                  LinkedIn
                </Button>
              )}

              {member.profile?.portfolio && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  render={
                    <a
                      href={member.profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Globe className="size-3.5" />
                  Portfolio
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}