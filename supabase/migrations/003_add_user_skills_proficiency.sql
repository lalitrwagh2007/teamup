-- Migration: Add proficiency column to user_skills table and RLS policies for skills/user_skills

ALTER TABLE public.user_skills
ADD COLUMN IF NOT EXISTS proficiency TEXT NOT NULL DEFAULT 'Intermediate'
CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));

-- Ensure RLS policies for skills table
DROP POLICY IF EXISTS "Skills are viewable by everyone" ON public.skills;
CREATE POLICY "Skills are viewable by everyone" ON public.skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert skills" ON public.skills;
CREATE POLICY "Authenticated users can insert skills" ON public.skills
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Ensure RLS policies for user_skills table
DROP POLICY IF EXISTS "User skills are viewable by everyone" ON public.user_skills;
CREATE POLICY "User skills are viewable by everyone" ON public.user_skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own user skills" ON public.user_skills;
CREATE POLICY "Users can insert their own user skills" ON public.user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own user skills" ON public.user_skills;
CREATE POLICY "Users can update their own user skills" ON public.user_skills
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own user skills" ON public.user_skills;
CREATE POLICY "Users can delete their own user skills" ON public.user_skills
  FOR DELETE USING (auth.uid() = user_id);

