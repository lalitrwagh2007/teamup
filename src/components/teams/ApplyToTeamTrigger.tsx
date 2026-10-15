"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import ApplyToTeamDialog from "./ApplyToTeamDialog";

import type { TeamRoleDetail } from "@/types/team";

interface ApplyToTeamTriggerProps {
  teamId: string;
  openRoles: TeamRoleDetail[];
}

export default function ApplyToTeamTrigger({
  teamId,
  openRoles,
}: ApplyToTeamTriggerProps) {
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  if (openRoles.length === 0) {
    return (
      <div className="space-y-2">
        <Button type="button" className="w-full" disabled>
          No Open Roles
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          This team is not accepting applications right now.
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="w-full"
        onClick={() => setShowApplyDialog(true)}
      >
        Apply to Join
      </Button>

      {showApplyDialog && (
        <ApplyToTeamDialog
          teamId={teamId}
          openRoles={openRoles}
          onClose={() => setShowApplyDialog(false)}
        />
      )}
    </>
  );
}
