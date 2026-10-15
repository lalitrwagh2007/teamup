"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import type { Interest } from "@/types/user";

interface TeamInterestFilterProps {
  interests: { id: string; name: string }[];
  currentInterestId: string | null;
  currentView: string | null;
}

export default function TeamInterestFilter({
  interests,
  currentInterestId,
  currentView,
}: TeamInterestFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Build the URL with the new interest filter
  const handleInterestChange = (interestId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (interestId) {
      params.set("interest", interestId);
    } else {
      params.delete("interest");
    }

    // Keep the current view parameter
    if (currentView) {
      params.set("view", currentView);
    }

    router.push(`/teams?${params.toString()}`);
  };

  const handleClear = () => {
    handleInterestChange(null);
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        value={currentInterestId ?? ""}
        onValueChange={handleInterestChange}
      >
        <SelectTrigger className="w-[220px] sm:w-[260px]">
          <SelectValue placeholder="All Interests" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Interests</SelectItem>
          {interests.map((interest) => (
            <SelectItem key={interest.id} value={interest.id}>
              {interest.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentInterestId && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleClear}
          aria-label="Clear interest filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}