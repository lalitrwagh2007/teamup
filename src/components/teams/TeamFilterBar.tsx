"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TeamFilterBarProps {
  interests: { id: string; name: string }[];
  skills: { id: string; name: string }[];
  currentFilters: {
    q: string | null;
    interest: string | null;
    skill: string | null;
    status: string | null;
    workMode: string | null;
    track: string | null;
    view: string | null;
  };
}

export default function TeamFilterBar({
  interests,
  skills,
  currentFilters,
}: TeamFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(currentFilters.q ?? "");

  const debouncedSearch = useDebouncedCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`/teams?${params.toString()}`);
    },
    300
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value || null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    debouncedSearch(null);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("interest");
    params.delete("skill");
    params.delete("status");
    params.delete("workMode");
    params.delete("track");
    router.replace(`/teams?${params.toString()}`);
  };

  const hasActiveFilters =
    currentFilters.q ||
    currentFilters.interest ||
    currentFilters.skill ||
    currentFilters.status ||
    currentFilters.workMode ||
    currentFilters.track;

  const handleInterestChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("interest", value);
    } else {
      params.delete("interest");
    }
    router.replace(`/teams?${params.toString()}`);
  };

  const handleSkillChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("skill", value);
    } else {
      params.delete("skill");
    }
    router.replace(`/teams?${params.toString()}`);
  };

  const handleStatusChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.replace(`/teams?${params.toString()}`);
  };

  const handleWorkModeChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("workMode", value);
    } else {
      params.delete("workMode");
    }
    router.replace(`/teams?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search teams, roles, skills..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {currentFilters.q && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={currentFilters.interest ?? ""}
          onValueChange={handleInterestChange}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <SelectValue placeholder="All Interests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Interests</SelectItem>
            {interests.map((interest) => (
              <SelectItem key={interest.id} value={interest.id}>
                {interest.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.skill ?? ""}
          onValueChange={handleSkillChange}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <SelectValue placeholder="All Skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill.id} value={skill.id}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.status ?? ""}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <SelectValue placeholder="All Active Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Active Teams</SelectItem>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.workMode ?? ""}
          onValueChange={handleWorkModeChange}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <SelectValue placeholder="Any Work Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Work Mode</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="On-site">On-site</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}