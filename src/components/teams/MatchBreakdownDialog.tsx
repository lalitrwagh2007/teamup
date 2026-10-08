"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MatchBreakdown } from "@/lib/matching/calculateMatch";
import { Button } from "@/components/ui/button";

interface MatchBreakdownDialogProps {
  overallScore: number;
  breakdown: MatchBreakdown;
}

const factors = [
  {
    key: "skills",
    label: "Skills",
    description: "How well your skills match the team's required skills.",
  },
  {
    key: "availability",
    label: "Availability",
    description: "How closely your availability aligns with the team.",
  },
  {
    key: "ratings",
    label: "Ratings",
    description: "Your compatibility based on available rating data.",
  },
  {
    key: "interests",
    label: "Interests",
    description: "How well your interests overlap with the team.",
  },
  {
    key: "reliability",
    label: "Reliability",
    description: "Your compatibility based on reliability data.",
  },
] as const;

export default function MatchBreakdownDialog({
  overallScore,
  breakdown,
}: MatchBreakdownDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>View Match Breakdown</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Match Breakdown</DialogTitle>
          <DialogDescription>
            See what contributes to your compatibility with this team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border bg-muted/40 p-5 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Overall Match
            </p>
            <p className="mt-1 text-4xl font-bold text-primary">
              {overallScore}%
            </p>
          </div>

          <div className="space-y-4">
            {factors.map((factor) => (
              <div key={factor.key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{factor.label}</h3>
                  <span className="text-lg font-bold">
                    {breakdown[factor.key]}%
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}