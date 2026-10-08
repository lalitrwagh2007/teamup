export const dynamic = "force-dynamic";

import { getMyApplications } from "@/app/actions/application";
import ApplicationsList from "@/components/applications/ApplicationsList";

export default async function ApplicationsPage() {
  const result = await getMyApplications();

  if (!result.success) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold text-white">
              My Applications
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {result.error ?? "Unable to load your applications."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            TeamUp
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            My Applications
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Track the applications you have submitted to teams and see their
            current status.
          </p>
        </div>

        <ApplicationsList applications={result.data ?? []} />
      </div>
    </main>
  );
}