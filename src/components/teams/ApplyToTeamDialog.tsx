"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { applyToTeam } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TeamRoleDetail } from "@/types/team";

interface ApplyToTeamDialogProps {
  teamId: string;
  openRoles: TeamRoleDetail[];
  onClose: () => void;
}

export default function ApplyToTeamDialog({
  teamId,
  openRoles,
  onClose,
}: ApplyToTeamDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (openRoles.length === 0) {
    return null;
  }

  function handleSubmit() {
    if (!selectedRoleId) {
      toast.error("Please select a role.");
      return;
    }

    startTransition(async () => {
      const result = await applyToTeam({
        teamId,
        roleId: selectedRoleId,
        message: message.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to submit application.");
        return;
      }

      toast.success("Application submitted successfully!");
      onClose();
    });
  }

  const selectedRole = openRoles.find((r) => r.id === selectedRoleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Apply to Team</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isPending}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select
              value={selectedRoleId}
              onValueChange={(value) => setSelectedRoleId(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {openRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title} ({role.spotsFilled}/{role.spotsTotal})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message (optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why are you a good fit for this role?"
              rows={4}
              disabled={isPending}
              maxLength={1000}
            />
          </div>

          {selectedRole && (
            <div className="rounded-lg border bg-muted p-3 text-sm">
              <p className="font-medium">{selectedRole.title}</p>
              {selectedRole.description && (
                <p className="text-muted-foreground mt-1">
                  {selectedRole.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Required skills:{" "}
                {selectedRole.requiredSkills.map((s) => s.name).join(", ") || "None"}
              </p>
              <p className="text-xs text-muted-foreground">
                Openings: {selectedRole.spotsFilled} / {selectedRole.spotsTotal}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isPending || !selectedRoleId}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}