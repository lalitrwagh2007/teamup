"use client";

import { useState } from "react";
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
      <button className="w-full" disabled>
        Apply to Join
      </button>
    );
  }

  return (
    <>
      <button
        className="w-full"
        onClick={() => setShowApplyDialog(true)}
      >
        Apply to Join
      </button>

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