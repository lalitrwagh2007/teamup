-- Migration 009: Add team_interests table for filtering teams by interest

-- Create team_interests table
CREATE TABLE IF NOT EXISTS public.team_interests (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, interest_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_interests_team_id ON public.team_interests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_interests_interest_id ON public.team_interests(interest_id);

-- Enable RLS
ALTER TABLE public.team_interests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view team_interests for non-archived teams
DROP POLICY IF EXISTS "Authenticated users can view team interests for discoverable teams" ON public.team_interests;
CREATE POLICY "Authenticated users can view team interests for discoverable teams"
  ON public.team_interests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_interests.team_id
      AND teams.status <> 'archived'
    )
  );

-- Allow team leaders to manage interests for their teams
DROP POLICY IF EXISTS "Team leaders can manage team interests" ON public.team_interests;
CREATE POLICY "Team leaders can manage team interests"
  ON public.team_interests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_interests.team_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_interests.team_id
      AND teams.leader_id = auth.uid()
    )
  );