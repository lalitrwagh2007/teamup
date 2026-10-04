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
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ProfileCompletionStep {
  label: string;
  done: boolean;
  href: string;
}

interface ProfileCompletionProps {
  percentage: number;
  steps: ProfileCompletionStep[];
}

export default function ProfileCompletion({
  percentage,
  steps,
}: ProfileCompletionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Profile completion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Progress bar */}
        <Progress value={percentage} className="gap-1">
          <ProgressLabel className="text-sm font-medium text-foreground">
            {percentage}% complete
          </ProgressLabel>
          <ProgressValue>{percentage}%</ProgressValue>
        </Progress>

        {/* Step checklist */}
        <ul className="flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-2.5">
              {step.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/40" />
              )}
              {step.done ? (
                <span className="text-sm text-muted-foreground line-through">
                  {step.label}
                </span>
              ) : (
                <Link
                  href={step.href}
                  className={cn(
                    "text-sm text-indigo-600 hover:underline"
                  )}
                >
                  {step.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {percentage < 100 && (
          <Button
            size="sm"
            className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Link href="/profile/edit">Complete your profile</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
