"use client";

import { useState } from "react";

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

export default function TeamForm() {
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Frontend only for now.
    console.log("Team form submitted");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Team name
        </label>

        <Input id="name" name="name" placeholder="Enter team name" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>

        <Textarea
          id="description"
          name="description"
          placeholder="Describe your team"
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="web-development">Web Development</SelectItem>

            <SelectItem value="ai-machine-learning">
              AI / Machine Learning
            </SelectItem>

            <SelectItem value="mobile-development">
              Mobile Development
            </SelectItem>

            <SelectItem value="design">Design</SelectItem>

            <SelectItem value="data-science">Data Science</SelectItem>

            <SelectItem value="cloud-devops">Cloud / DevOps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="maxMembers" className="text-sm font-medium">
            Maximum members
          </label>

          <Input
            id="maxMembers"
            name="maxMembers"
            type="number"
            min={2}
            placeholder="5"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>

          <Input
            id="location"
            name="location"
            placeholder="e.g. Pune, Remote"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Work mode</label>

        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger>
            <SelectValue placeholder="Select work mode" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="remote">Remote</SelectItem>

            <SelectItem value="hybrid">Hybrid</SelectItem>

            <SelectItem value="on-site">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="skills" className="text-sm font-medium">
          Required skills
        </label>

        <Input
          id="skills"
          name="skills"
          placeholder="e.g. React, TypeScript, Node.js"
          required
        />

        <p className="text-xs text-muted-foreground">
          Separate multiple skills with commas.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="openRole" className="text-sm font-medium">
          Open role
        </label>

        <Input
          id="openRole"
          name="openRole"
          placeholder="e.g. Frontend Developer"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="deadline" className="text-sm font-medium">
          Application deadline
        </label>

        <Input id="deadline" name="deadline" type="date" required />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Create Team
      </Button>
    </form>
  );
}
