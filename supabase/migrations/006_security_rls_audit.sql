-- Migration: Security audit - RLS policies for core team tables
-- This migration adds comprehensive Row Level Security policies for:
-- teams, team_members, team_roles, team_role_skills, applications, invitations, team_tasks, team_resources

-- =============================================================================
-- TEAMS
-- =============================================================================
-- Authenticated users can read discoverable teams (non-archived)
DROP POLICY IF EXISTS "Authenticated users can view discoverable teams" ON public.teams;
CREATE POLICY "Authenticated users can view discoverable teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (status <> 'archived');

-- Team leaders can view their own teams (including archived)
DROP POLICY IF EXISTS "Team leaders can view their own teams" ON public.teams;
CREATE POLICY "Team leaders can view their own teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (leader_id = auth.uid());

-- Authenticated users can create teams (they become the leader)
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (leader_id = auth.uid());

-- Only team leader can update their team
DROP POLICY IF EXISTS "Team leaders can update their own teams" ON public.teams;
CREATE POLICY "Team leaders can update their own teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (leader_id = auth.uid())
  WITH CHECK (leader_id = auth.uid());

-- Only team leader can delete their team
DROP POLICY IF EXISTS "Team leaders can delete their own teams" ON public.teams;
CREATE POLICY "Team leaders can delete their own teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (leader_id = auth.uid());

-- =============================================================================
-- TEAM_ROLES
-- =============================================================================
-- Authenticated users can read roles for discoverable teams
DROP POLICY IF EXISTS "Authenticated users can view team roles for discoverable teams" ON public.team_roles;
CREATE POLICY "Authenticated users can view team roles for discoverable teams"
  ON public.team_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.status <> 'archived'
    )
  );

-- Team leaders can read all roles for their teams (including archived)
DROP POLICY IF EXISTS "Team leaders can view all roles for their teams" ON public.team_roles;
CREATE POLICY "Team leaders can view all roles for their teams"
  ON public.team_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Only team leader can create roles for their team
DROP POLICY IF EXISTS "Team leaders can create roles for their teams" ON public.team_roles;
CREATE POLICY "Team leaders can create roles for their teams"
  ON public.team_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Only team leader can update roles for their team
DROP POLICY IF EXISTS "Team leaders can update roles for their teams" ON public.team_roles;
CREATE POLICY "Team leaders can update roles for their teams"
  ON public.team_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Only team leader can delete roles for their team
DROP POLICY IF EXISTS "Team leaders can delete roles for their teams" ON public.team_roles;
CREATE POLICY "Team leaders can delete roles for their teams"
  ON public.team_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_roles.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- =============================================================================
-- TEAM_ROLE_SKILLS
-- =============================================================================
-- Readable where team roles are readable
DROP POLICY IF EXISTS "Authenticated users can view role skills for discoverable teams" ON public.team_role_skills;
CREATE POLICY "Authenticated users can view role skills for discoverable teams"
  ON public.team_role_skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_roles
      JOIN public.teams ON teams.id = team_roles.team_id
      WHERE team_roles.id = team_role_skills.role_id
      AND teams.status <> 'archived'
    )
  );

-- Team leaders can view all role skills for their teams
DROP POLICY IF EXISTS "Team leaders can view role skills for their teams" ON public.team_role_skills;
CREATE POLICY "Team leaders can view role skills for their teams"
  ON public.team_role_skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_roles
      JOIN public.teams ON teams.id = team_roles.team_id
      WHERE team_roles.id = team_role_skills.role_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Mutations restricted to leader of related team
DROP POLICY IF EXISTS "Team leaders can manage role skills for their teams" ON public.team_role_skills;
CREATE POLICY "Team leaders can manage role skills for their teams"
  ON public.team_role_skills FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_roles
      JOIN public.teams ON teams.id = team_roles.team_id
      WHERE team_roles.id = team_role_skills.role_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_roles
      JOIN public.teams ON teams.id = team_roles.team_id
      WHERE team_roles.id = team_role_skills.role_id
      AND teams.leader_id = auth.uid()
    )
  );

-- =============================================================================
-- TEAM_MEMBERS
-- =============================================================================
-- Team members can view other members of their team
DROP POLICY IF EXISTS "Team members can view members of their team" ON public.team_members;
CREATE POLICY "Team members can view members of their team"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Team leaders can view all members of their teams
DROP POLICY IF EXISTS "Team leaders can view members of their teams" ON public.team_members;
CREATE POLICY "Team leaders can view members of their teams"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Prevent arbitrary INSERT - membership only through application/invitation flows
-- The application/invitation acceptance Server Actions use the authenticated user's ID
-- and verify permissions before inserting, so we allow INSERT for authenticated users
-- but the business logic in Server Actions enforces the authorization.
-- However, we add a WITH CHECK to ensure users can only insert themselves:
DROP POLICY IF EXISTS "Users can insert themselves as team members via authorized flows" ON public.team_members;
CREATE POLICY "Users can insert themselves as team members via authorized flows"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Team leaders can update member roles in their teams
DROP POLICY IF EXISTS "Team leaders can update members in their teams" ON public.team_members;
CREATE POLICY "Team leaders can update members in their teams"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Team leaders can remove members from their teams
-- Users can also remove themselves (leave team)
DROP POLICY IF EXISTS "Team leaders or self can remove members" ON public.team_members;
CREATE POLICY "Team leaders or self can remove members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
      AND teams.leader_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- =============================================================================
-- APPLICATIONS
-- =============================================================================
-- Applicants can create their own applications
DROP POLICY IF EXISTS "Applicants can create their own applications" ON public.applications;
CREATE POLICY "Applicants can create their own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

-- Applicants can read their own applications
DROP POLICY IF EXISTS "Applicants can read their own applications" ON public.applications;
CREATE POLICY "Applicants can read their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

-- Team leaders can read applications for their teams
DROP POLICY IF EXISTS "Team leaders can read applications for their teams" ON public.applications;
CREATE POLICY "Team leaders can read applications for their teams"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = applications.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Applicants can withdraw (update status to 'withdrawn') their own pending applications
DROP POLICY IF EXISTS "Applicants can withdraw their own applications" ON public.applications;
CREATE POLICY "Applicants can withdraw their own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid() AND status = 'pending')
  WITH CHECK (applicant_id = auth.uid() AND status = 'withdrawn');

-- Only team leaders can accept/reject applications (status changes to accepted/rejected)
DROP POLICY IF EXISTS "Team leaders can accept or reject applications" ON public.applications;
CREATE POLICY "Team leaders can accept or reject applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = applications.team_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = applications.team_id
      AND teams.leader_id = auth.uid()
    )
    AND status IN ('accepted', 'rejected')
  );

-- =============================================================================
-- INVITATIONS
-- =============================================================================
-- Only team leaders can create invitations
DROP POLICY IF EXISTS "Team leaders can create invitations" ON public.invitations;
CREATE POLICY "Team leaders can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = invitations.team_id
      AND teams.leader_id = auth.uid()
    )
    AND inviter_id = auth.uid()
  );

-- Invitees can read invitations addressed to them
DROP POLICY IF EXISTS "Invitees can read their own invitations" ON public.invitations;
CREATE POLICY "Invitees can read their own invitations"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (invitee_id = auth.uid());

-- Team leaders can read invitations they sent for their teams
DROP POLICY IF EXISTS "Team leaders can read invitations for their teams" ON public.invitations;
CREATE POLICY "Team leaders can read invitations for their teams"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = invitations.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Invitees can accept/reject their own invitations
DROP POLICY IF EXISTS "Invitees can accept or reject their invitations" ON public.invitations;
CREATE POLICY "Invitees can accept or reject their invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (invitee_id = auth.uid() AND status = 'pending')
  WITH CHECK (invitee_id = auth.uid() AND status IN ('accepted', 'rejected'));

-- Team leaders can cancel invitations they sent
DROP POLICY IF EXISTS "Team leaders can cancel their invitations" ON public.invitations;
CREATE POLICY "Team leaders can cancel their invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = invitations.team_id
      AND teams.leader_id = auth.uid()
    )
    AND inviter_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = invitations.team_id
      AND teams.leader_id = auth.uid()
    )
    AND inviter_id = auth.uid()
    AND status = 'cancelled'
  );

-- =============================================================================
-- TEAM_TASKS
-- =============================================================================
-- Team members can read tasks for their teams
DROP POLICY IF EXISTS "Team members can view tasks for their teams" ON public.team_tasks;
CREATE POLICY "Team members can view tasks for their teams"
  ON public.team_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team members can create tasks for their teams
DROP POLICY IF EXISTS "Team members can create tasks for their teams" ON public.team_tasks;
CREATE POLICY "Team members can create tasks for their teams"
  ON public.team_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Task creator or team leader can update tasks
DROP POLICY IF EXISTS "Task creator or team leader can update tasks" ON public.team_tasks;
CREATE POLICY "Task creator or team leader can update tasks"
  ON public.team_tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_tasks.team_id
      AND teams.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_tasks.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- Task creator or team leader can delete tasks
DROP POLICY IF EXISTS "Task creator or team leader can delete tasks" ON public.team_tasks;
CREATE POLICY "Task creator or team leader can delete tasks"
  ON public.team_tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_tasks.team_id
      AND teams.leader_id = auth.uid()
    )
  );

-- =============================================================================
-- TEAM_RESOURCES
-- =============================================================================
-- Team members can read resources for their teams
DROP POLICY IF EXISTS "Team members can view resources for their teams" ON public.team_resources;
CREATE POLICY "Team members can view resources for their teams"
  ON public.team_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_resources.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team members can create resources for their teams
DROP POLICY IF EXISTS "Team members can create resources for their teams" ON public.team_resources;
CREATE POLICY "Team members can create resources for their teams"
  ON public.team_resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_resources.team_id
      AND team_members.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Resource creator or team leader can delete resources
DROP POLICY IF EXISTS "Resource creator or team leader can delete resources" ON public.team_resources;
CREATE POLICY "Resource creator or team leader can delete resources"
  ON public.team_resources FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_resources.team_id
      AND teams.leader_id = auth.uid()
    )
  );