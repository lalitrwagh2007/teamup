"use client";

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

const teams = [
  {
    id: "1",
    name: "AI Builders",
    description:
      "A team focused on building practical AI tools and experimenting with modern machine learning technologies.",
    category: "AI / Machine Learning",
    currentMembers: 4,
    maxMembers: 6,
    skills: ["Python", "Next.js", "OpenAI", "Machine Learning"],
    mode: "Remote",
    location: "India",
  },
  {
    id: "2",
    name: "Web Innovators",
    description:
      "Frontend and backend developers collaborating on modern web applications and developer tools.",
    category: "Web Development",
    currentMembers: 3,
    maxMembers: 5,
    skills: ["React", "TypeScript", "Node.js"],
    mode: "Hybrid",
    location: "Pune",
  },
  {
    id: "3",
    name: "Design Collective",
    description:
      "Designers and developers working together to create polished user experiences and product interfaces.",
    category: "Design",
    currentMembers: 2,
    maxMembers: 4,
    skills: ["Figma", "UI/UX", "React"],
    mode: "Remote",
    location: "Mumbai",
  },
  {
    id: "4",
    name: "Mobile Makers",
    description:
      "A collaborative team building mobile applications and learning modern mobile development.",
    category: "Mobile Development",
    currentMembers: 4,
    maxMembers: 6,
    skills: ["React Native", "TypeScript", "Firebase"],
    mode: "On-site",
    location: "Bengaluru",
  },
  {
    id: "5",
    name: "Cloud Crew",
    description:
      "Developers interested in cloud infrastructure, DevOps, deployment automation, and scalable systems.",
    category: "Cloud / DevOps",
    currentMembers: 3,
    maxMembers: 6,
    skills: ["AWS", "Docker", "Node.js"],
    mode: "Hybrid",
    location: "Hyderabad",
  },
  {
    id: "6",
    name: "Data Explorers",
    description:
      "A team for people interested in data analytics, visualization, and data-driven applications.",
    category: "Data Science",
    currentMembers: 2,
    maxMembers: 5,
    skills: ["Python", "SQL", "Data Analysis"],
    mode: "Remote",
    location: "India",
  },
];

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

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query) ||
        team.category.toLowerCase().includes(query) ||
        team.skills.some((teamSkill) =>
          teamSkill.toLowerCase().includes(query),
        );

      const matchesSkill = skill === "All" || team.skills.includes(skill);

      const matchesCategory = category === "All" || team.category === category;

      const matchesMode = mode === "All" || team.mode === mode;

      return matchesSearch && matchesSkill && matchesCategory && matchesMode;
    });
  }, [search, skill, category, mode]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Discover Teams</h1>

        <p className="mt-2 text-muted-foreground">
          Find a team that matches your skills, interests, and preferred way of
          working.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          type="search"
          placeholder="Search teams..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="lg:col-span-1"
        />

        <Select value={skill} onValueChange={setSkill}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>

          <SelectContent>
            {skillOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "All" ? "All skills" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>

          <SelectContent>
            {categoryOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by mode" />
          </SelectTrigger>

          <SelectContent>
            {modeOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "All" ? "All modes" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTeams.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No teams found</h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            No teams match your current search and filters. Try changing or
            clearing some filters.
          </p>
        </div>
      )}
    </main>
  );
}
