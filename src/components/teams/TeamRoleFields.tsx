"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  AvailableRoleSkill,
  TeamRoleInput,
  TeamTrack,
} from "@/types/team";

interface TeamRoleFieldsProps {
  roles: TeamRoleInput[];
  onChange: (roles: TeamRoleInput[]) => void;
  availableSkills: AvailableRoleSkill[];
  teamTrack: TeamTrack;
  disabled?: boolean;
}

const TECHNICAL_SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Designer",
];

const COMMUNITY_SUGGESTIONS = [
  "Event Coordinator",
  "Volunteer Coordinator",
  "Designer",
];

export default function TeamRoleFields({
  roles,
  onChange,
  availableSkills,
  teamTrack,
  disabled = false,
}: TeamRoleFieldsProps) {
  const suggestions =
    teamTrack === "technical" ? TECHNICAL_SUGGESTIONS : COMMUNITY_SUGGESTIONS;

  function addRole() {
    onChange([
      ...roles,
      {
        title: "",
        description: "",
        spotsTotal: 1,
        skillIds: [],
      },
    ]);
  }

  function updateRole(index: number, update: Partial<TeamRoleInput>) {
    onChange(
      roles.map((role, roleIndex) =>
        roleIndex === index
          ? {
              ...role,
              ...update,
            }
          : role,
      ),
    );
  }

  function removeRole(index: number) {
    onChange(roles.filter((_, roleIndex) => roleIndex !== index));
  }

  function toggleSkill(roleIndex: number, skillId: string) {
    const role = roles[roleIndex];

    const nextSkillIds = role.skillIds.includes(skillId)
      ? role.skillIds.filter((id) => id !== skillId)
      : [...role.skillIds, skillId];

    updateRole(roleIndex, {
      skillIds: nextSkillIds,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Required Roles</h3>

          <p className="text-sm text-muted-foreground">
            Define the roles and skills your team needs.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addRole}
          disabled={disabled}
        >
          Add Role
        </Button>
      </div>

      {roles.length === 0 && (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No required roles added yet.
        </div>
      )}

      {roles.map((role, index) => (
        <div
          key={role.id ?? `new-role-${index}`}
          className="space-y-4 rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-medium">Role {index + 1}</h4>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRole(index)}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`role-title-${index}`}
              className="text-sm font-medium"
            >
              Role title
            </label>

            <Input
              id={`role-title-${index}`}
              list={`role-suggestions-${index}`}
              value={role.title}
              onChange={(event) =>
                updateRole(index, {
                  title: event.target.value,
                })
              }
              placeholder={
                teamTrack === "technical"
                  ? "Frontend Developer"
                  : "Event Coordinator"
              }
              disabled={disabled}
              maxLength={100}
            />

            <datalist id={`role-suggestions-${index}`}>
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`role-description-${index}`}
              className="text-sm font-medium"
            >
              Description
            </label>

            <Textarea
              id={`role-description-${index}`}
              value={role.description ?? ""}
              onChange={(event) =>
                updateRole(index, {
                  description: event.target.value,
                })
              }
              placeholder="Describe what this role will work on."
              disabled={disabled}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`role-spots-${index}`}
              className="text-sm font-medium"
            >
              Number of openings
            </label>

            <Input
              id={`role-spots-${index}`}
              type="number"
              min={1}
              max={100}
              step={1}
              value={role.spotsTotal}
              onChange={(event) =>
                updateRole(index, {
                  spotsTotal: Number(event.target.value) || 1,
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Required skills</p>

              <p className="text-xs text-muted-foreground">
                Choose from existing TeamUp skills.
              </p>
            </div>

            {availableSkills.length > 0 ? (
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-3">
                {availableSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={role.skillIds.includes(skill.id)}
                      onChange={() => toggleSkill(index, skill.id)}
                      disabled={disabled}
                      className="h-4 w-4"
                    />

                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No existing skills available.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
