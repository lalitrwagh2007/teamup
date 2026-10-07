import { Badge } from "@/components/ui/badge";

export type ApplicationStatusType =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

interface ApplicationStatusProps {
  status: ApplicationStatusType;
}

const STATUS_CONFIG: Record<
  ApplicationStatusType,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
};

export default function ApplicationStatus({ status }: ApplicationStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
