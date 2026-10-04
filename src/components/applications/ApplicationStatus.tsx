import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export type ApplicationStatusType = "pending" | "accepted" | "rejected" | "reviewing";

export interface ApplicationData {
  id: string;
  teamName: string;
  role: string;
  appliedAt: string; // display string e.g. "2 days ago"
  status: ApplicationStatusType;
}

interface ApplicationStatusProps {
  application: ApplicationData;
}

const STATUS_CONFIG: Record<
  ApplicationStatusType,
  { label: string; icon: React.ElementType; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  reviewing: {
    label: "Under review",
    icon: HelpCircle,
    classes: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  rejected: {
    label: "Not selected",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 ring-red-200",
  },
};

export default function ApplicationStatus({ application }: ApplicationStatusProps) {
  const config = STATUS_CONFIG[application.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      {/* Left: team info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {application.teamName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {application.role} · Applied {application.appliedAt}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
          config.classes
        )}
      >
        <Icon className="size-3.5" />
        {config.label}
      </span>

      {/* Arrow link */}
      <Link
        href={`/applications/${application.id}`}
        aria-label={`View application for ${application.teamName}`}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
