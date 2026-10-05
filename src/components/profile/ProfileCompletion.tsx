import { cn } from "@/lib/utils";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ProfileCompletionProps {
  percentage: number;
  className?: string;
}

export default function ProfileCompletion({
  percentage,
  className,
}: ProfileCompletionProps) {
  // Clamp value between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Profile completion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Progress bar */}
        <Progress value={clampedPercentage} className="gap-1">
          <ProgressLabel className="text-sm font-medium text-foreground">
            Profile {clampedPercentage}% complete
          </ProgressLabel>
          <ProgressValue />
        </Progress>

        {clampedPercentage < 100 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Add more profile details to help teams find you!
            </p>
            <Button
              size="sm"
              className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              asChild
            >
              <Link href="/profile/edit">Complete your profile</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-emerald-600 font-medium">
            Your profile is fully complete!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
