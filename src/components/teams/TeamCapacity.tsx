import { cn } from "@/lib/utils";
import { Progress, ProgressLabel } from "@/components/ui/progress";

export interface TeamCapacityProps {
  currentMembers: number;
  maxMembers: number;
  className?: string;
}

export default function TeamCapacity({
  currentMembers,
  maxMembers,
  className,
}: TeamCapacityProps) {
  // Avoid division by zero
  const safeMax = maxMembers > 0 ? maxMembers : 1;

  // Calculate and clamp percentage between 0 and 100
  const rawPercentage = (currentMembers / safeMax) * 100;
  const percentage = Math.min(Math.max(rawPercentage, 0), 100);

  const spotsRemaining = Math.max(0, maxMembers - currentMembers);
  const isFull = currentMembers >= maxMembers;

  return (
    <div className={cn("w-full", className)}>
      <Progress value={percentage} className="w-full gap-1.5">
        <ProgressLabel className="text-sm font-medium text-foreground">
          {currentMembers} / {maxMembers} members
        </ProgressLabel>
        <div className="ml-auto text-sm">
          {isFull ? (
            <span className="font-semibold text-emerald-600">Team Full</span>
          ) : (
            <span className="text-muted-foreground">
              {spotsRemaining} {spotsRemaining === 1 ? "spot" : "spots"} remaining
            </span>
          )}
        </div>
      </Progress>
    </div>
  );
}
