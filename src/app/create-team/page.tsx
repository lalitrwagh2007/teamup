import TeamForm from "@/components/teams/TeamForm";

export default function CreateTeamPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a Team
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Set up your team, define the skills you need, choose how you want to
          work, and add an open role for people to apply to.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
        <TeamForm />
      </div>
    </main>
  );
}
