import Link from "next/link";
import { Plus, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Navbar from "@/components/layout/Navbar";
import TeamCard from "@/components/teams/TeamCard";

import {
  getTeamsForListing,
} from "@/app/actions/team";

import type { TeamRecord } from "@/types/team";

export const dynamic = "force-dynamic";

async function getTeamsData(): Promise<TeamRecord[]> {
  const result = await getTeamsForListing();

  if (!result.success) {
    console.error("Failed to load teams:", result.error);
    return [];
  }

  return result.data ?? [];
}

export default async function TeamsPage() {
  const teams = await getTeamsData();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Discover Teams
            </h1>

            <p className="mt-2 text-muted-foreground">
              Find teams looking for members, or create your own.
            </p>
          </div>

          <Link href="/create-team">
            <Button size="sm" className="gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus className="size-4" />
              Create Team
            </Button>
          </Link>
        </div>

        {teams.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
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
                No teams are recruiting yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                Be the first to create a team and start building together!
              </p>
              <Link href="/create-team">
                <Button size="lg" className="gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  <Plus className="size-4" />
                  Create Your Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}