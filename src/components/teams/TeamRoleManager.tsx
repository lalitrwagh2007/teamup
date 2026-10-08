"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTeamRole } from "@/app/actions/team";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { AvailableRoleSkill, TeamTrack } from "@/types/team";

interface TeamRoleManagerProps {
  teamId: string;
  teamTrack: TeamTrack;
  availableSkills: AvailableRoleSkill[];
}

const TECHNICAL_ROLE_SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Designer",
];

const COMMUNITY_ROLE_SUGGESTIONS = [
  "Event Coordinator",
  "Volunteer Coordinator",
  "Designer",
];

export default function TeamRoleManager({
  teamId,
  teamTrack,
  availableSkills,
}: TeamRoleManagerProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [spotsTotal, setSpotsTotal] = useState("1");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const roleSuggestions = useMemo(
    () =>
      teamTrack === "technical"
        ? TECHNICAL_ROLE_SUGGESTIONS
        : COMMUNITY_ROLE_SUGGESTIONS,
    [teamTrack],
  );

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId],
    );
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setSpotsTotal("1");
    setSelectedSkillIds([]);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const parsedSpots = Number(spotsTotal);

    if (!title.trim()) {
      setError("Role title is required.");
      return;
    }

    if (
      !Number.isInteger(parsedSpots) ||
      parsedSpots < 1 ||
      parsedSpots > 100
    ) {
      setError("Available spots must be between 1 and 100.");
      return;
    }

    startTransition(async () => {
      const result = await createTeamRole(teamId, {
        title: title.trim(),
        description: description.trim() || null,
        spotsTotal: parsedSpots,
        skillIds: selectedSkillIds,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    });
  }

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)}>
        Add Open Role
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <div>
        <h3 className="text-lg font-semibold">Create Open Role</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Add a role your team is currently recruiting for.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="team-role-title" className="text-sm font-medium">
          Role
        </label>

        <Input
          id="team-role-title"
          list="team-role-suggestions"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={
            teamTrack === "technical"
              ? "Frontend Developer"
              : "Event Coordinator"
          }
          disabled={isPending}
          maxLength={100}
          required
        />

        <datalist id="team-role-suggestions">
          {roleSuggestions.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <label htmlFor="team-role-description" className="text-sm font-medium">
          Description
        </label>

        <Textarea
          id="team-role-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what this role will work on."
          disabled={isPending}
          maxLength={1000}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="team-role-spots" className="text-sm font-medium">
          Available spots
        </label>

        <Input
          id="team-role-spots"
          type="number"
          min={1}
          max={100}
          step={1}
          value={spotsTotal}
          onChange={(event) => setSpotsTotal(event.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Required skills</p>

          <p className="text-xs text-muted-foreground">
            Select from existing TeamUp skills.
          </p>
        </div>

        {availableSkills.length > 0 ? (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border p-3">
            {availableSkills.map((skill) => {
              const checked = selectedSkillIds.includes(skill.id);

              return (
                <label
                  key={skill.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSkill(skill.id)}
                    disabled={isPending}
                    className="h-4 w-4"
                  />

                  <span className="text-sm">{skill.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border p-3 text-sm text-muted-foreground">
            No existing skills are available.
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Role"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            resetForm();
            setIsOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
