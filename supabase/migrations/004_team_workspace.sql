CREATE TABLE IF NOT EXISTS public.team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'doing', 'done')),
  assigned_role_id UUID REFERENCES public.team_roles(id) ON DELETE SET NULL,
  assigned_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS team_tasks_team_id_idx
  ON public.team_tasks(team_id);

CREATE INDEX IF NOT EXISTS team_tasks_status_idx
  ON public.team_tasks(status);

CREATE INDEX IF NOT EXISTS team_tasks_assigned_member_idx
  ON public.team_tasks(assigned_member_id);
