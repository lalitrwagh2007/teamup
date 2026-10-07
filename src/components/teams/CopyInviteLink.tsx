"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CopyInviteLinkProps {
  inviteUrl: string;
}

export default function CopyInviteLink({ inviteUrl }: CopyInviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      disabled={!inviteUrl}
    >
      <Copy className="mr-2 h-4 w-4" />
      {copied ? "Copied!" : "Copy Invite Link"}
    </Button>
  );
}
