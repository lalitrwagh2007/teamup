import { notFound } from "next/navigation";
import { Briefcase, MapPin, Users } from "lucide-react";

import { calculateMatch } from "@/lib/matching/calculateMatch";
import { createClient } from "@/lib/supabase/server";
import type { ProficiencyLevel } from "@/types/database";

import MatchBreakdownDialog from "@/components/teams/MatchBreakdownDialog";
import CopyInviteLink from "@/components/teams/CopyInviteLink";
import SkillTags from "@/components/profile/SkillTags";
import TeamCapacity from "@/components/teams/TeamCapacity";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamRoleSkillRow {
  skill_id: string;
  skills: {
    id: string;
    name: string;
  } | null;
}

interface TeamRoleRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  team_role_skills: TeamRoleSkillRow[];
}

interface TeamMemberRow {
  id: string;
  user_id: string;
  member_role: string;
}

interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  mode: string | null;
  location: string | null;
  max_members: number;
  team_roles: TeamRoleRow[];
  team_members: TeamMemberRow[];
}

interface UserSkillRow {
  skill_id: string;
  proficiency: ProficiencyLevel;
  skills: {
    id: string;
    name: string;
  } | null;
}

interface UserInterestRow {
  interest_id: string;
  interests: {
    name: string;
  } | null;
}

interface TeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select(
      `
      id,
      name,
      description,
      category,
      mode,
      location,
      max_members,
      team_roles (
        id,
        title,
        description,
        status,
        team_role_skills (
          skill_id,
          skills (
            id,
            name
          )
        )
      ),
      team_members (
        id,
        user_id,
        member_role
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (teamError) {
    throw new Error("Unable to load team details.");
  }

  if (!teamData) {
    notFound();
  }

  const team = teamData as unknown as TeamRow;

  const teamSkills = Array.from(
    new Set(
      team.team_roles.flatMap((role) =>
        role.team_role_skills
          .filter((item) => item.skills !== null)
          .map((item) => item.skills!.name),
      ),
    ),
  );

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  let matchResult: ReturnType<typeof calculateMatch> | null = null;

  if (user) {
    const [profileResult, skillsResult, interestsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("availability")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("user_skills")
        .select(
          `
            skill_id,
            proficiency,
            skills (
              id,
              name
            )
          `,
        )
        .eq("user_id", user.id),

      supabase
        .from("user_interests")
        .select(
          `
            interest_id,
            interests (
              name
            )
          `,
        )
        .eq("user_id", user.id),
    ]);

    if (!profileResult.error && !skillsResult.error && !interestsResult.error) {
      const userSkills = (skillsResult.data ?? []) as unknown as UserSkillRow[];
      const userInterests = (interestsResult.data ??
        []) as unknown as UserInterestRow[];

      matchResult = calculateMatch({
        user: {
          skills: userSkills
            .filter((item) => item.skills !== null)
            .map((item) => ({
              id: item.skills!.id,
              name: item.skills!.name,
              proficiency: item.proficiency,
            })),
          availabilityHours: null,
          interests: userInterests
            .filter((item) => item.interests !== null)
            .map((item) => item.interests!.name),
          rating: null,
          responseReliability: null,
          availabilityStatus: profileResult.data?.availability ?? null,
        },
        team: {
          roles: team.team_roles.map((role) => ({
            id: role.id,
            title: role.title,
            requiredSkills: role.team_role_skills
              .filter((item) => item.skills !== null)
              .map((item) => ({
                id: item.skills!.id,
                name: item.skills!.name,
              })),
          })),
          requiredSkills: teamSkills.map((name) => ({ name })),
          availabilityHours: null,
          interests: null,
        },
      });
    }
  }

  const openRoles = team.team_roles.filter((role) => role.status !== "closed");

  const inviteUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  }/teams/${team.id}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {team.category && <Badge variant="secondary">{team.category}</Badge>}

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {team.name}
            </h1>

            <p className="mt-3 max-w-3xl text-muted-foreground">
              {team.description ?? "No team description available."}
            </p>
          </div>

          {matchResult && (
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                {matchResult.overallScore}% Match
              </span>

              <MatchBreakdownDialog
                overallScore={matchResult.overallScore}
                breakdown={matchResult.breakdown}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {openRoles.length > 0
                  ? openRoles[0].title
                  : "Team collaboration opportunity"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {teamSkills.length > 0 ? (
                <SkillTags skills={teamSkills} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specific skills listed.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>

            <CardContent>
              {team.team_members.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {team.team_members.map((member, index) => (
                    <div key={member.id} className="rounded-lg border p-4">
                      <p className="font-medium">Team Member {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.member_role}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No members have joined this team yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Roles</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {openRoles.length > 0 ? (
                openRoles.map((role) => (
                  <div key={role.id} className="rounded-lg border p-4">
                    <h3 className="font-semibold">{role.title}</h3>

                    {role.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {role.description}
                      </p>
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

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Capacity</CardTitle>
            </CardHeader>

            <CardContent>
              <TeamCapacity
                currentMembers={team.team_members.length}
                maxMembers={team.max_members}
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
