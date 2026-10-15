"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTeam } from "@/app/actions/team";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TeamRoleFields from "@/components/teams/TeamRoleFields";

import type {
  AvailableRoleSkill,
  TeamRoleInput,
  TeamTrack,
  WorkMode,
} from "@/types/team";

import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface TeamFormProps {
  availableSkills: AvailableRoleSkill[];
  availableInterests: { id: string; name: string }[];
}

export default function TeamForm({
  availableSkills,
  availableInterests,
}: TeamFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState<TeamTrack>("technical");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState<WorkMode>("Remote");
  const [location, setLocation] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");

  const [roles, setRoles] = useState<TeamRoleInput[]>([]);

  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const MAX_INTERESTS = 5;

  const SELECTED_CLASS = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-indigo-600 border-indigo-600 text-white";
  const UNSELECTED_BASE = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-muted border-border text-foreground";
  const HOVER_MUTED = " hover:bg-muted/50";
  const DISABLED_SUFFIX = " opacity-50 cursor-not-allowed";
  const UNSELECTED_CLASS = UNSELECTED_BASE + " hover:bg-muted/50";
  const SELECTED_CLASS_STR = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-indigo-600 border-indigo-600 text-white";
  const UNSELECTED_CLASS_STR = "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-muted border-border text-foreground hover:bg-muted/50";
  const DISABLED_SUFFIX_STR = " opacity-50 cursor-not-allowed";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const parsedMaxMembers = Number(maxMembers);

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (
      !Number.isInteger(parsedMaxMembers) ||
      parsedMaxMembers < 1 ||
      parsedMaxMembers > 100
    ) {
      setError("Maximum members must be between 1 and 100.");
      return;
    }

    for (const role of roles) {
      if (!role.title.trim()) {
        setError("Every required role needs a title.");
        return;
      }

      if (
        !Number.isInteger(role.spotsTotal) ||
        role.spotsTotal < 1 ||
        role.spotsTotal > 100
      ) {
        setError("Each role must have between 1 and 100 openings.");
        return;
      }
    }

    if (selectedInterestIds.length > 5) {
      setError("You can select up to 5 interests.");
      return;
    }

    startTransition(async () => {
      const result = await createTeam({
        name: name.trim(),
        description: description.trim() || null,
        track,
        category: category.trim() || null,
        mode,
        location: location.trim() || null,
        maxMembers: parsedMaxMembers,
        roles,
        interestIds: selectedInterestIds,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/teams/" + result.data.id);

      router.refresh();
    });
  }

  function toggleInterest(interestId: string) {
    setSelectedInterestIds((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, interestId];
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>

          <p className="mt-2 text-muted-foreground">
            Build your team and define the roles you need.
          </p>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-6">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              Team name
            </label>

            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="team-description" className="text-sm font-medium">
              Description
            </label>

            <Textarea
              id="team-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isPending}
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Track</label>

              <Select
                value={track}
                onValueChange={(value) => {
                  if (value === "technical" || value === "community") {
                    setTrack(value);
                  }
                }}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="technical">
                    Technical & Academic
                  </SelectItem>

                  <SelectItem value="community">Community & Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="team-category" className="text-sm font-medium">
                Category
              </label>

              <Input
                id="team-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Work mode</label>

              <Select
                value={mode}
                onValueChange={(value) => {
                  if (
                    value === "Remote" ||
                    value === "Hybrid" ||
                    value === "On-site"
                  ) {
                    setMode(value);
                  }
                }}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>

                  <SelectItem value="Hybrid">Hybrid</SelectItem>

                  <SelectItem value="On-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="team-location" className="text-sm font-medium">
                Location
              </label>

              <Input
                id="team-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="team-max-members" className="text-sm font-medium">
              Maximum members
            </label>

            <Input
              id="team-max-members"
              type="number"
              min={1}
              max={100}
              step={1}
              value={maxMembers}
              onChange={(event) => setMaxMembers(event.target.value)}
              disabled={isPending}
              required
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Interests</label>
            <button
              type="button"
              onClick={() => setShowInterests(!showInterests)}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {showInterests ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span>{showInterests ? "Hide" : "Select"}</span>
            </button>
          </div>

          {showInterests && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select up to 5 interests. Selected: {selectedInterestIds.length}
                /5
              </p>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    disabled={
                      isPending ||
                      (!selectedInterestIds.includes(interest.id) &&
                        selectedInterestIds.length >= 5)
                    }
                    className={
                      selectedInterestIds.includes(interest.id)
                        ? "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-indigo-600 border-indigo-600 text-white"
                        : "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-muted border-border text-foreground hover:bg-muted/50" +
                          (!selectedInterestIds.includes(interest.id) &&
                          selectedInterestIds.length >= 5
                            ? " opacity-50 cursor-not-allowed"
                            : "")
                    }
                  >
                    {selectedInterestIds.includes(interest.id) && (
                      <Check className="h-4 w-4" />
                    )}
                    {interest.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <TeamRoleFields
            roles={roles}
            onChange={setRoles}
            availableSkills={availableSkills}
            teamTrack={track}
            disabled={isPending}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating Team..." : "Create Team"}
        </Button>
      </form>
    </main>
  );
}
