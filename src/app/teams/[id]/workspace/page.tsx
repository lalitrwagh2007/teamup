import { redirect } from "next/navigation";
import { getTeamTasks } from "@/app/actions/tasks";
import { getTeamResources } from "@/app/actions/resources";
import TeamTaskBoard from "@/components/teams/TeamTaskBoard";
import TeamResources from "@/components/teams/TeamResources";
import { createClient } from "@/lib/supabase/server";

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamWorkspacePage({
  params,
}: WorkspacePageProps) {
  const { id: teamId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/teams/${teamId}/workspace`);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("team_members")
    .select("id, team_id, user_id, role_id, member_role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    redirect(`/teams/${teamId}`);
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, description, track, category, mode, location, status")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError || !team) {
    redirect("/teams");
  }

  const [tasks, resources] = await Promise.all([
    getTeamTasks(teamId),
    getTeamResources(teamId),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Team Workspace
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {team.name}
          </h1>

          {team.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {team.description}
            </p>
          )}
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Workspace
            </p>
            <h2 className="mt-2 text-xl font-semibold">Team Overview</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your shared team workspace is ready.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Membership
            </p>
            <h2 className="mt-2 text-xl font-semibold capitalize">
              {membership.member_role}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Confirmed team member
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Status
            </p>
            <h2 className="mt-2 text-xl font-semibold capitalize">
              {team.status.replace("_", " ")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Team workspace access is active.
            </p>
          </div>
        </section>

        <TeamTaskBoard teamId={teamId} initialTasks={tasks} />

        <TeamResources
          teamId={teamId}
          initialResources={resources}
        />
      </div>
    </main>
  );
}
