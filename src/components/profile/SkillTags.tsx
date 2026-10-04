import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SkillTagsProps {
  skills: string[];
  className?: string;
}

export default function SkillTags({ skills, className }: SkillTagsProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {skills.map((skill) => (
        <Badge
          key={skill}
          variant="secondary"
          className="px-2.5 py-0.5 text-xs font-medium"
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
}
import { Badge } from "@/components/ui/badge";

type SkillTagsProps = {
  skills: string[];
};

export function SkillTags({ skills }: SkillTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={skill} variant="secondary">
          {skill}
        </Badge>
      ))}
    </div>
  );
}