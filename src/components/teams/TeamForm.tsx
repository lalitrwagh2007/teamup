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

interface TeamFormProps {
  availableSkills: AvailableRoleSkill[];
}

export default function TeamForm({ availableSkills }: TeamFormProps) {
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

  const [error, setError] = useState<string | null>(null);

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
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/teams/${result.data.id}`);

      router.refresh();
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
                    Technical &amp; Academic
                  </SelectItem>

                  <SelectItem value="community">
                    Community &amp; Social
                  </SelectItem>
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
