"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProficiencyLevel, UserSkillItem } from "@/types/user";
import { X } from "lucide-react";

export type SkillTagItem =
  | string
  | UserSkillItem
  | {
      id?: string;
      skillId?: string;
      name: string;
      proficiency?: ProficiencyLevel | string;
    };

export interface SkillTagsProps {
  skills: SkillTagItem[];
  showProficiency?: boolean;
  onRemoveSkill?: (skill: SkillTagItem) => void;
  className?: string;
}

const PROFICIENCY_STYLES: Record<string, string> = {
  Beginner: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900",
  Intermediate: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
  Advanced: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900",
  Expert: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
};

export default function SkillTags({
  skills,
  showProficiency = true,
  onRemoveSkill,
  className,
}: SkillTagsProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {skills.map((item, index) => {
        const isObject = typeof item === "object" && item !== null;
        const name = isObject ? item.name : item;
        const proficiency = isObject ? item.proficiency : undefined;
        const key = isObject
          ? (item as UserSkillItem).skillId || (item as { id?: string }).id || `${name}-${index}`
          : `${item}-${index}`;

        const profStyle = proficiency ? PROFICIENCY_STYLES[proficiency] : undefined;

        return (
          <Badge
            key={key}
            variant="secondary"
            className={cn(
              "px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1.5 transition-all border",
              profStyle ? profStyle : "border-transparent"
            )}
          >
            <span>{name}</span>
            {showProficiency && proficiency && (
              <span className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border/50">
                {proficiency}
              </span>
            )}
            {onRemoveSkill && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSkill(item);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label={`Remove ${name}`}
              >
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
