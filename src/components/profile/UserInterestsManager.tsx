"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  addUserInterest,
  getUserInterests,
  removeUserInterest,
} from "@/app/actions/interests";

import type { Interest } from "@/types/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserInterestsManager() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestName, setInterestName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInterests = async () => {
      try {
        const result = await getUserInterests();

        if (!isMounted) return;

        if (result.success) {
          setInterests(result.data);
        } else {
          toast.error(result.message ?? "Failed to load interests.");
        }
      } catch (error) {
        console.error("Load interests error:", error);

        if (isMounted) {
          toast.error("Failed to load interests.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInterests();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddInterest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = interestName.trim();

    if (!trimmedName) {
      toast.error("Please enter an interest.");
      return;
    }

    setIsPending(true);

    try {
      const result = await addUserInterest(trimmedName);

      if (!result.success) {
        toast.error(result.message ?? "Failed to add interest.");
        return;
      }

      setInterests(result.data);
      setInterestName("");

      toast.success(result.message ?? "Interest added successfully.");
    } catch (error) {
      console.error("Add interest error:", error);
      toast.error("Failed to add interest.");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveInterest = async (interestId: string) => {
    setIsPending(true);

    try {
      const result = await removeUserInterest(interestId);

      if (!result.success) {
        toast.error(result.message ?? "Failed to remove interest.");
        return;
      }

      setInterests(result.data);

      toast.success(result.message ?? "Interest removed successfully.");
    } catch (error) {
      console.error("Remove interest error:", error);
      toast.error("Failed to remove interest.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interests</CardTitle>

        <CardDescription>
          Add interests that help teams discover what you care about.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <form
          onSubmit={handleAddInterest}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            value={interestName}
            onChange={(event) => setInterestName(event.target.value)}
            placeholder="E.g. Web3, EdTech, Healthcare"
            maxLength={50}
            disabled={isPending}
            aria-label="Interest name"
          />

          <Button
            type="submit"
            disabled={isPending || !interestName.trim()}
            className="gap-2 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add interest
          </Button>
        </form>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your interests...
          </div>
        ) : interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No interests added yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span>{interest.name}</span>

                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest.id)}
                  disabled={isPending}
                  className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Remove ${interest.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
