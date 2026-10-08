"use client";

import { useEffect, useMemo, useState } from "react";

import { getTeams } from "@/app/actions/team";
import TeamCard from "@/components/teams/TeamCard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TeamTrack = "technical" | "community";

type ExploreTeam = {
  id: string;
  name: string;
  description: string;
  track: TeamTrack;
  category: string;
  currentMembers: number;
  maxMembers: number;
  skills: string[];
  mode: string;
  location: string;
};

export default function ExplorePage() {
  const [teams, setTeams] = useState<ExploreTeam[]>([]);
  const [activeTrack, setActiveTrack] = useState<TeamTrack>("technical");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      setIsLoading(true);
      setError(null);

      const result = await getTeams();

      if (!result.success) {
        setError(result.error);
        setTeams([]);
        setIsLoading(false);
        return;
      }

      const mappedTeams: ExploreTeam[] = result.data.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description ?? "",
        track: team.track,
        category: team.category ?? "General",
        currentMembers: 1,
        maxMembers: team.maxMembers,
        skills: [],
        mode: team.mode ?? "Remote",
        location: team.location ?? "Not specified",
      }));

      setTeams(mappedTeams);
      setIsLoading(false);
    }

    loadTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesTrack = team.track === activeTrack;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        team.name.toLowerCase().includes(normalizedSearch) ||
        team.description.toLowerCase().includes(normalizedSearch) ||
        team.category.toLowerCase().includes(normalizedSearch) ||
        team.location.toLowerCase().includes(normalizedSearch);

      return matchesTrack && matchesSearch;
    });
  }, [teams, activeTrack, search]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Teams
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Discover teams that match your interests, goals, and preferred way of
          working.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeTrack === "technical" ? "default" : "outline"}
            onClick={() => setActiveTrack("technical")}
          >
            Technical &amp; Academic
          </Button>

          <Button
            type="button"
            variant={activeTrack === "community" ? "default" : "outline"}
            onClick={() => setActiveTrack("community")}
          >
            Community &amp; Social
          </Button>
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search teams by name, category, or location..."
          className="max-w-xl"
        />
      </div>

      {isLoading && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading teams...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredTeams.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">No teams found</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or switch to the other track.
          </p>
        </div>
      )}

      {!isLoading && !error && filteredTeams.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
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
      )}
    </main>
  );
}
