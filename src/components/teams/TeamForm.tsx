"use client";

import { useState } from "react";
import { Team, TeamRole } from "@/types/team";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface TeamFormProps {
  initialData?: Partial<Team>;
  onSubmit: (data: Partial<Team>) => void;
  isLoading?: boolean;
}

export function TeamForm({ initialData, onSubmit, isLoading = false }: TeamFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [mode, setMode] = useState<"Remote" | "Hybrid" | "On-site">(initialData?.mode || "Remote");
  const [location, setLocation] = useState(initialData?.location || "");
  const [maxMembers, setMaxMembers] = useState(initialData?.maxMembers || 4);

  // Overall Skills state
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  // Roles state
  const [roles, setRoles] = useState<TeamRole[]>(initialData?.roles || []);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleSkillsInput, setRoleSkillsInput] = useState("");

  // Skill Handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Role Handlers
  const handleAddRole = () => {
    if (!roleTitle.trim()) return;

    const parsedSkills = roleSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newRole: TeamRole = {
      id: `role-${Date.now()}`,
      title: roleTitle.trim(),
      requiredSkills: parsedSkills,
    };

    setRoles([...roles, newRole]);
    setRoleTitle("");
    setRoleSkillsInput("");
  };

  const handleRemoveRole = (roleId: string) => {
    setRoles(roles.filter((r) => r.id !== roleId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      category,
      mode,
      location,
      maxMembers,
      skills,
      roles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Team Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Hackathon Squad"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is your team building or aiming to achieve?"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Web Development, AI, Mobile"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Max Members</label>
          <Input
            type="number"
            min={2}
            max={20}
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Mode</label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as "Remote" | "Hybrid" | "On-site")}
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Global or City, Country"
            required
          />
        </div>
      </div>

      {/* Team Skills Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Required Team Skills</label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add skill (e.g. Next.js, React)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddSkill}>
            Add Skill
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 text-sm py-1 px-2.5">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Required Roles Section */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium">Open / Required Roles</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role Title (e.g. Frontend Engineer)"
          />
          <Input
            value={roleSkillsInput}
            onChange={(e) => setRoleSkillsInput(e.target.value)}
            placeholder="Role skills (comma separated, e.g. React, Tailwind)"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddRole}>
          Add Role
        </Button>

        {/* Roles Display List */}
        <div className="space-y-2 pt-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground"
            >
              <div>
                <p className="text-sm font-semibold">{role.title}</p>
                {role.requiredSkills && role.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {role.requiredSkills.map((sk) => (
                      <Badge key={sk} variant="outline" className="text-xs">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRole(role.id)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : initialData?.name ? "Update Team" : "Create Team"}
      </Button>
    </form>
  );
}