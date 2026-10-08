"use client";
import type { TeamTrack, WorkMode } from "@/types/database";
import { useMemo, useState } from "react";
import TeamCard from "@/components/teams/TeamCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export interface TeamDiscoveryItem {
  id: string;
  name: string;
  description: string;
  track: TeamTrack;
  category: string;
  currentMembers: number;
  maxMembers: number;
  skills: string[];
  mode: WorkMode;
  location: string;
  matchScore?: number;
}
interface TeamsPageProps {
  teams: TeamDiscoveryItem[];
}

const skillOptions = [
  "All",
  "Python",
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Figma",
  "AWS",
  "Docker",
  "SQL",
];

const categoryOptions = [
  "All",
  "AI / Machine Learning",
  "Web Development",
  "Design",
  "Mobile Development",
  "Cloud / DevOps",
  "Data Science",
];

const modeOptions = ["All", "Remote", "Hybrid", "On-site"];

type TrackFilter = "all" | "technical" | "community";

export default function TeamsPage({ teams }: TeamsPageProps) {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [track, setTrack] = useState<TrackFilter>("all");

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        query.length === 0 ||
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query) ||
        team.skills.some((item) => item.toLowerCase().includes(query));

      const matchesSkill =
        skill === "All" ||
        team.skills.some((item) => item.toLowerCase() === skill.toLowerCase());

      const matchesCategory = category === "All" || team.category === category;

      const matchesMode = mode === "All" || team.mode === mode;

      const matchesTrack = track === "all" || team.track === track;

      return (
        matchesSearch &&
        matchesSkill &&
        matchesCategory &&
        matchesMode &&
        matchesTrack
      );
    });
  }, [teams, search, skill, category, mode, track]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Explore Teams</h1>
          <p className="text-muted-foreground">
            Find teams that match your skills, interests, and goals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTrack("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              track === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Teams
          </button>

          <button
            type="button"
            onClick={() => setTrack("technical")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              track === "technical"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Technical & Academic
          </button>

          <button
            type="button"
            onClick={() => setTrack("community")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              track === "community"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Community & Social
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Select
            value={skill}
            onValueChange={(value) => value !== null && setSkill(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              {skillOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "All" ? "All Skills" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category}
            onValueChange={(value) => value !== null && setCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "All" ? "All Categories" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={mode}
            onValueChange={(value) => value !== null && setMode(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "All" ? "All Modes" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <h2 className="text-lg font-semibold">No teams found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                matchScore={team.matchScore}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
