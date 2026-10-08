"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  acceptInvitation,
  rejectInvitation,
} from "@/app/actions/invitation";
import { Button } from "@/components/ui/button";

interface InvitationActionsProps {
  invitationId: string;
  teamId: string;
}

export default function InvitationActions({
  invitationId,
  teamId,
}: InvitationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setLoading("accept");

    const result = await acceptInvitation(invitationId);

    if (!result.success) {
      toast.error(result.error ?? "Failed to accept invitation.");
      setLoading(null);
      return;
    }

    toast.success("Invitation accepted!");
    router.push(`/teams/${teamId}`);
    router.refresh();
  };

  const handleReject = async () => {
    setLoading("reject");

    const result = await rejectInvitation(invitationId);

    if (!result.success) {
      toast.error(result.error ?? "Failed to reject invitation.");
      setLoading(null);
      return;
    }

    toast.success("Invitation rejected.");
    router.push(`/teams/${teamId}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        className="flex-1"
        onClick={handleAccept}
        disabled={loading !== null}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {loading === "accept" ? "Accepting..." : "Accept Invitation"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={handleReject}
        disabled={loading !== null}
      >
        <XCircle className="mr-2 h-4 w-4" />
        {loading === "reject" ? "Rejecting..." : "Reject Invitation"}
      </Button>
    </div>
  );
}
