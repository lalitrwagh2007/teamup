import { notFound } from "next/navigation";
import { Briefcase, MapPin, Users } from "lucide-react";

import {
  getAvailableRoleSkills,
  getTeamDetails,
  isTeamOwner,
} from "@/app/actions/team";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import SkillTags from "@/components/profile/SkillTags";
import TeamCapacity from "@/components/teams/TeamCapacity";
import CopyInviteLink from "@/components/teams/CopyInviteLink";
import TeamOwnerActions from "@/components/teams/TeamOwnerActions";
import TeamRoleManager from "@/components/teams/TeamRoleManager";

interface TeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;

  const result = await getTeamDetails(id);

  if (!result.success) {
    if (
      result.error === "Invalid team ID." ||
      result.error === "Team not found."
    ) {
      notFound();
    }

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {result.error}
        </div>
      </main>
    );
  }

  const team = result.data;

  const canManageTeam = await isTeamOwner(team.id);

  const availableSkillsResult = canManageTeam
    ? await getAvailableRoleSkills()
    : null;

  const availableRoleSkills = availableSkillsResult?.success
    ? availableSkillsResult.data
    : [];

  const inviteUrl = `/teams/${team.id}`;

  const requiredSkills = [
    ...new Set(
      team.roles.flatMap((role) =>
        role.requiredSkills.map((skill) => skill.name),
      ),
    ),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {team.category && <Badge variant="secondary">{team.category}</Badge>}

          <Badge variant="outline">
            {team.track === "technical"
              ? "Technical & Academic"
              : "Community & Social"}
          </Badge>

          {team.mode && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {team.mode}
            </span>
          )}

          {team.location && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {team.location}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {team.name}
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          {team.description || "No description provided."}
        </p>

        {canManageTeam && (
          <div className="mt-5">
            <TeamOwnerActions
              team={team}
              availableSkills={availableRoleSkills}
            />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Team owner */}
          <Card>
            <CardHeader>
              <CardTitle>Team Owner</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="font-medium">{team.owner?.name ?? "Team owner"}</p>
            </CardContent>
          </Card>

          {/* Required skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>

            <CardContent>
              {requiredSkills.length > 0 ? (
                <SkillTags skills={requiredSkills} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No required skills have been added yet.
                </p>
              )}
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
              {team.members.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {team.members.map((member) => (
                    <div key={member.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {member.profile?.name ?? "Team member"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {member.memberRole}
                          </p>
                        </div>

                        {member.userId === team.leaderId && (
                          <Badge variant="secondary">Owner</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No team members found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Open roles */}
          <Card>
            <CardHeader>
              <CardTitle>Open Roles</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {canManageTeam && (
                <div className="mb-5">
                  <TeamRoleManager
                    teamId={team.id}
                    teamTrack={team.track}
                    availableSkills={availableRoleSkills}
                  />
                </div>
              )}

              {team.roles.length > 0 ? (
                team.roles.map((role) => (
                  <div key={role.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{role.title}</h3>

                        {role.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {role.spotsFilled} / {role.spotsTotal} filled
                      </span>
                    </div>

                    {role.requiredSkills.length > 0 && (
                      <div className="mt-3">
                        <SkillTags
                          skills={role.requiredSkills.map(
                            (skill) => skill.name,
                          )}
                        />
                      </div>
                    )}
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
              {!canManageTeam && (
                <Button className="w-full">Apply to Join</Button>
              )}

              {canManageTeam && (
                <p className="text-sm text-muted-foreground">
                  You are the owner of this team.
                </p>
              )}

              <CopyInviteLink inviteUrl={inviteUrl} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
