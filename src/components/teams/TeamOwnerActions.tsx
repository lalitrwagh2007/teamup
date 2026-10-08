"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteTeam, updateTeam } from "@/app/actions/team";

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

import type { TeamDetails, TeamTrack } from "@/types/team";

interface TeamOwnerActionsProps {
  team: TeamDetails;
}

export default function TeamOwnerActions({ team }: TeamOwnerActionsProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(team.name);

  const [description, setDescription] = useState(team.description ?? "");

  const [track, setTrack] = useState<TeamTrack>(team.track);

  const [category, setCategory] = useState(team.category ?? "");

  const [location, setLocation] = useState(team.location ?? "");

  const [maxMembers, setMaxMembers] = useState(String(team.maxMembers));

  const [error, setError] = useState<string | null>(null);

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const parsedMaxMembers = Number(maxMembers);

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (track !== "technical" && track !== "community") {
      setError("Invalid team track.");
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

    startTransition(async () => {
      const result = await updateTeam(team.id, {
        name: name.trim(),
        description: description.trim() || null,
        track,
        category: category.trim() || null,
        location: location.trim() || null,
        maxMembers: parsedMaxMembers,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsEditing(false);

      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteTeam(team.id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/explore");
      router.refresh();
    });
  }

  if (!isEditing) {
    return (
      <div className="space-y-3">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={isPending}
          >
            Edit Team
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Team"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Edit Team</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update your team information.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-team-name" className="text-sm font-medium">
          Team name
        </label>

        <Input
          id="edit-team-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-team-description" className="text-sm font-medium">
          Description
        </label>

        <Textarea
          id="edit-team-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isPending}
          rows={4}
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

              <SelectItem value="community">Community &amp; Social</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-team-category" className="text-sm font-medium">
            Category
          </label>

          <Input
            id="edit-team-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="edit-team-location" className="text-sm font-medium">
            Location
          </label>

          <Input
            id="edit-team-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-team-max-members"
            className="text-sm font-medium"
          >
            Maximum members
          </label>

          <Input
            id="edit-team-max-members"
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
          {isPending ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
