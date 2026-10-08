interface TeamCapacityProps {
  currentMembers: number;
  maxMembers: number;
}

export default function TeamCapacity({
  currentMembers,
  maxMembers,
}: TeamCapacityProps) {
  const safeCurrentMembers = Math.max(0, currentMembers);
  const safeMaxMembers = Math.max(0, maxMembers);

  const percentage =
    safeMaxMembers > 0
      ? Math.min((safeCurrentMembers / safeMaxMembers) * 100, 100)
      : 0;

  const isFull = safeMaxMembers > 0 && safeCurrentMembers >= safeMaxMembers;

  const isOverCapacity =
    safeMaxMembers > 0 && safeCurrentMembers > safeMaxMembers;

  const remainingSpots =
    safeMaxMembers > 0 ? Math.max(safeMaxMembers - safeCurrentMembers, 0) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Team capacity</span>

        <span className="text-sm text-muted-foreground">
          {safeCurrentMembers} / {safeMaxMembers}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {safeMaxMembers === 0 ? (
        <p className="text-xs text-muted-foreground">
          Team capacity has not been configured.
        </p>
      ) : isOverCapacity ? (
        <p className="text-xs font-medium text-destructive">
          Team is over capacity.
        </p>
      ) : isFull ? (
        <p className="text-xs font-medium text-muted-foreground">
          Team is full.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {remainingSpots} {remainingSpots === 1 ? "spot" : "spots"} remaining
        </p>
      )}
    </div>
  );
}
