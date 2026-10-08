CREATE TABLE IF NOT EXISTS public.team_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('GitHub', 'Figma', 'Google Docs', 'Other')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS team_resources_team_id_idx
  ON public.team_resources(team_id);

CREATE INDEX IF NOT EXISTS team_resources_created_by_idx
  ON public.team_resources(created_by);
