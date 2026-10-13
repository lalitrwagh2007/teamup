"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
        <p className="mt-2 text-muted-foreground">
          {error.message ?? "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}