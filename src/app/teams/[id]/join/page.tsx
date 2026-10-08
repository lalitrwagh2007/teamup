import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Users, XCircle } from "lucide-react";

import { getInvitationByToken } from "@/app/actions/invitation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import InvitationActions from "@/components/teams/InvitationActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JoinPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function JoinTeamPage({
  params,
  searchParams,
}: JoinPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  const result = await getInvitationByToken(token);

  if (!result.success || !result.invitation) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>
                {result.error ?? "This invitation link is invalid."}
              </p>
            </div>

            <Link
              href={`/teams/${id}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Team
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (result.invitation.team_id !== id) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/teams/${id}/join?token=${token}`)}`);
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, description")
    .eq("id", id)
    .single();

  if (!team) {
    notFound();
  }

  const { data: role } = result.invitation.role_id
    ? await supabase
        .from("team_roles")
        .select("id, title")
        .eq("id", result.invitation.role_id)
        .single()
    : { data: null };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted">
            <Users className="h-6 w-6" />
          </div>

          <CardTitle className="text-2xl">
            You&apos;ve been invited to join {team.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {team.description && (
            <p className="text-muted-foreground">{team.description}</p>
          )}

          {role && (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Invited Role</p>
              <p className="mt-1 font-semibold">{role.title}</p>
            </div>
          )}

          {result.invitation.message && (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Message from the team
              </p>
              <p className="mt-1">{result.invitation.message}</p>
            </div>
          )}

          <InvitationActions
            invitationId={result.invitation.id}
            teamId={id}
          />
        </CardContent>
      </Card>
    </main>
  );
}
