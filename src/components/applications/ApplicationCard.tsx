import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ApplicationStatus, {
  type ApplicationStatusType,
} from "@/components/applications/ApplicationStatus";

interface ApplicationCardProps {
  teamName: string;
  role: string;
  appliedDate: string;
  status: ApplicationStatusType;
  matchPercentage: number;
}

export default function ApplicationCard({
  teamName,
  role,
  appliedDate,
  status,
  matchPercentage,
}: ApplicationCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">{teamName}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">{role}</p>
          </div>

          <ApplicationStatus status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Match</span>

          <span className="font-medium">{matchPercentage}%</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Applied</span>

          <span className="font-medium">{appliedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
