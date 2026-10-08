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

type TeamTrack = "technical" | "community";

export default function TeamForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState<TeamTrack | "">("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");

  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const parsedMaxMembers = Number(maxMembers);

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (track !== "technical" && track !== "community") {
      setError("Please select a valid track.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!location.trim()) {
      setError("Location is required.");
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
      const result = await createTeam({
        name: name.trim(),
        description: description.trim(),
        track,
        category: category.trim(),
        location: location.trim(),
        maxMembers: parsedMaxMembers,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium leading-none"
        >
          Team name
        </label>

        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your team name"
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium leading-none"
        >
          Description
        </label>

        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe your team, project, or idea"
          rows={5}
          disabled={isPending}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Track
          </label>

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
              <SelectValue placeholder="Select track" />
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
          <label
            htmlFor="category"
            className="text-sm font-medium leading-none"
          >
            Category
          </label>

          <Input
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. AI / Machine Learning"
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-sm font-medium leading-none"
          >
            Location
          </label>

          <Input
            id="location"
            name="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Pune, India"
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="maxMembers"
            className="text-sm font-medium leading-none"
          >
            Maximum members
          </label>

          <Input
            id="maxMembers"
            name="maxMembers"
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating team..." : "Create team"}
        </Button>
      </div>
    </form>
  );
}