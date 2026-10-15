import Link from "next/link";
import { Plus, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Navbar from "@/components/layout/Navbar";
import TeamCard from "@/components/teams/TeamCard";
import TeamFilterBar from "@/components/teams/TeamFilterBar";

import {
  getTeamsForListing,
  type TeamListingFilters,
} from "@/app/actions/team";

import {
  getAllInterests,
} from "@/app/actions/interests";

import {
  getAllSkills,
} from "@/app/actions/skills";

import type { TeamRecord } from "@/types/team";

export const dynamic = "force-dynamic";

async function getTeamsData(
  filters: TeamListingFilters,
): Promise<{ teams: TeamRecord[]; total: number }> {
  const result = await getTeamsForListing(filters);

  if (!result.success) {
    console.error("Failed to load teams:", result.error);
    return { teams: [], total: 0 };
  }

  return { teams: result.data ?? [], total: result.data?.length ?? 0 };
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    interest?: string;
    skill?: string;
    status?: string;
    workMode?: string;
    track?: string;
  }>;
}) {
  const params = await searchParams;

  const opportunitiesOnly = params.view === "opportunities";

  const filters = {
    opportunitiesOnly,
    search: params.q ?? null,
    interestId: params.interest ?? null,
    skillId: params.skill ?? null,
    status: params.status ?? null,
    workMode: params.workMode ?? null,
    track: params.track ?? null,
  };

  const [teamsResult, interests, skills] = await Promise.all([
    getTeamsData(filters),
    getAllInterests(),
    getAllSkills(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {opportunitiesOnly ? "Opportunities" : "Discover Teams"}
            </h1>

            <p className="mt-2 text-muted-foreground">
              {opportunitiesOnly
                ? "Browse teams that are actively recruiting members."
                : "Explore all active teams, or create your own."}
            </p>
          </div>

          <Link href="/create-team">
            <Button
              size="sm"
              className="gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              Create Team
            </Button>
          </Link>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {teamsResult.total === 1
              ? "1 team found"
              : `${teamsResult.total} teams found`}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 rounded-xl border bg-card p-4">
          <TeamFilterBar
            interests={
              interests.success
                ? interests.data.map((i) => ({ id: i.id, name: i.name }))
                : []
            }
            skills={
              skills.success
                ? skills.data.map((s) => ({ id: s.id, name: s.name }))
                : []
            }
            currentFilters={{
              q: params.q ?? null,
              interest: params.interest ?? null,
              skill: params.skill ?? null,
              status: params.status ?? null,
              workMode: params.workMode ?? null,
              track: params.track ?? null,
              view: params.view ?? null,
            }}
          />
        </div>

        {teamsResult.teams.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {teamsResult.teams.map((team) => (
              <TeamCard
                key={team.id}
                id={team.id}
                name={team.name}
                description={team.description ?? ""}
                category={team.category ?? "General"}
                currentMembers={team.currentMembers ?? 1}
                maxMembers={team.maxMembers}
                skills={[]}
                mode={team.mode ?? "Remote"}
                location={team.location ?? "Not specified"}
              />
            ))}
          </div>
        ) : (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                {teamsResult.total === 0 &&
                (filters.search ||
                  filters.interestId ||
                  filters.skillId ||
                  filters.status ||
                  filters.workMode ||
                  filters.track)
                  ? "No teams match your search or filters."
                  : "No teams are recruiting yet"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              {teamsResult.total === 0 &&
              (filters.search ||
                filters.interestId ||
                filters.skillId ||
                filters.status ||
                filters.workMode ||
                filters.track) ? (
                <div>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters.
                  </p>
                  <Link href="/create-team">
                    <Button
                      size="lg"
                      className="gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <Plus className="size-4" />
                      Create Your Team
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a team and start building together!
                  </p>
                  <Link href="/create-team">
                    <Button
                      size="lg"
                      className="gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <Plus className="size-4" />
                      Create Your Team
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}