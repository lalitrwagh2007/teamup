"use client";

import { useState } from "react";
import { applyToTeam } from "@/app/actions/application";

interface ApplyButtonProps {
  teamId: string;
  roleId: string;
  roleName?: string;
  disabled?: boolean;
  className?: string;
}

export default function ApplyButton({
  teamId,
  roleId,
  roleName,
  disabled = false,
  className = "",
}: ApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await applyToTeam({
        teamId,
        roleId,
        message: message.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to submit application.");
        return;
      }

      setSuccess(true);
      setMessage("");
    } catch (err) {
      console.error("Apply button error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setIsOpen(false);
    setError(null);
    setMessage("");

    if (!success) {
      setSuccess(false);
    }
  };

  if (success) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-400">
            Application submitted successfully.
          </p>
          <p className="mt-1 text-xs text-emerald-300/80">
            The team owner can now review your application.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Apply for another role
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className={`rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        Apply{roleName ? ` for ${roleName}` : ""}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-dialog-title"
          >
            <div className="mb-5">
              <h2
                id="apply-dialog-title"
                className="text-lg font-semibold text-white"
              >
                Apply to team
              </h2>

              {roleName && (
                <p className="mt-1 text-sm text-zinc-400">
                  Applying for{" "}
                  <span className="text-zinc-200">{roleName}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="application-message"
                className="text-sm font-medium text-zinc-200"
              >
                Message{" "}
                <span className="font-normal text-zinc-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="application-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell the team why you'd be a good fit..."
                rows={5}
                maxLength={1000}
                disabled={isSubmitting}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 disabled:opacity-50"
              />

              <div className="flex justify-end">
                <span className="text-xs text-zinc-600">
                  {message.length}/1000
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}