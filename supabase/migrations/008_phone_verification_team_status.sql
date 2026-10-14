-- Migration 008:
-- Team status + secure verified contact information

BEGIN;

-- ============================================================
-- 1. TEAM STATUS
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS team_status text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_team_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_team_status_check
    CHECK (
      team_status IN (
        'finding_team',
        'already_have_team'
      )
    );
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_team_status
ON public.profiles(team_status);


-- ============================================================
-- 2. AUTHENTICATED USERS MAY DISCOVER PUBLIC PROFILES
-- ============================================================
--
-- Private phone/contact data is NOT stored in profiles.
-- It is stored separately in profile_contacts.
--
-- This policy allows TeamUp user discovery/search.
-- Only authenticated users can browse profiles.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view profiles"
ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);


-- ============================================================
-- 3. PRIVATE CONTACT TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profile_contacts (
  user_id uuid PRIMARY KEY
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  phone_number text,

  phone_verified boolean NOT NULL DEFAULT false,

  share_phone_with_team boolean NOT NULL DEFAULT false,

  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profile_contacts_phone_e164_check
  CHECK (
    phone_number IS NULL
    OR phone_number ~ '^\+[1-9][0-9]{1,14}$'
  )
);


-- ============================================================
-- 4. UNIQUE VERIFIED PHONE
-- ============================================================
--
-- The same successfully verified phone number should not belong
-- to multiple TeamUp contact records.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_contacts_verified_phone
ON public.profile_contacts(phone_number)
WHERE phone_number IS NOT NULL
  AND phone_verified = true;


-- ============================================================
-- 5. ENFORCE VERIFICATION USING SUPABASE AUTH
-- ============================================================
--
-- CRITICAL SECURITY RULE:
--
-- Never trust phone_verified sent from browser/client code.
--
-- Every INSERT or UPDATE recomputes phone_verified by checking
-- the corresponding Supabase Auth user.
--
-- Therefore a user cannot manually send:
--
-- phone_verified = true
--
-- and bypass OTP verification.
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_profile_contact_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  is_verified boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = NEW.user_id
      AND u.phone IS NOT NULL
      AND u.phone = NEW.phone_number
      AND u.phone_confirmed_at IS NOT NULL
  )
  INTO is_verified;

  NEW.phone_verified := is_verified;

  -- Never allow an unverified number to be shared.
  IF NEW.phone_verified = false THEN
    NEW.share_phone_with_team := false;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION public.enforce_profile_contact_verification()
FROM PUBLIC;


DROP TRIGGER IF EXISTS enforce_profile_contact_verification_trigger
ON public.profile_contacts;

CREATE TRIGGER enforce_profile_contact_verification_trigger
BEFORE INSERT OR UPDATE
ON public.profile_contacts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_contact_verification();


-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS set_profile_contacts_updated_at
ON public.profile_contacts;

CREATE TRIGGER set_profile_contacts_updated_at
BEFORE UPDATE
ON public.profile_contacts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profile_contacts
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 8. OWNER SELECT POLICY
-- ============================================================
--
-- A user can read their OWN complete private contact record.
-- ============================================================

DROP POLICY IF EXISTS "Users can view own contact"
ON public.profile_contacts;

CREATE POLICY "Users can view own contact"
ON public.profile_contacts
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


-- ============================================================
-- 9. OWNER INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own contact"
ON public.profile_contacts;

CREATE POLICY "Users can insert own contact"
ON public.profile_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================
-- 10. OWNER UPDATE POLICY
-- ============================================================

DROP POLICY IF EXISTS "Users can update own contact"
ON public.profile_contacts;

CREATE POLICY "Users can update own contact"
ON public.profile_contacts
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================
-- 11. OWNER DELETE POLICY
-- ============================================================

DROP POLICY IF EXISTS "Users can delete own contact"
ON public.profile_contacts;

CREATE POLICY "Users can delete own contact"
ON public.profile_contacts
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);


-- ============================================================
-- 12. TABLE PERMISSIONS
-- ============================================================
--
-- Anonymous users receive no access.
--
-- Authenticated users receive table permissions, but RLS still
-- restricts them to their own private contact row.
-- ============================================================

REVOKE ALL
ON public.profile_contacts
FROM PUBLIC;

REVOKE ALL
ON public.profile_contacts
FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.profile_contacts
TO authenticated;


-- ============================================================
-- 13. SECURE TEAM CONTACT FUNCTION
-- ============================================================
--
-- Used when User A wants to view User B's shared contact.
--
-- Contact is returned ONLY when:
--
-- 1. Caller is authenticated.
-- 2. Caller and target are actual members of the same TeamUp team.
-- 3. Target enabled share_phone_with_team.
-- 4. Target phone is verified.
--
-- Pending/rejected applications do NOT grant access because this
-- checks team_members, not applications.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_shared_team_contact(
  target_user_id uuid
)
RETURNS TABLE (
  phone_number text,
  phone_verified boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public, auth
AS $$
  SELECT
    pc.phone_number,
    pc.phone_verified

  FROM public.profile_contacts pc

  WHERE auth.uid() IS NOT NULL

    AND pc.user_id = target_user_id

    AND pc.phone_number IS NOT NULL

    AND pc.phone_verified = true

    AND pc.share_phone_with_team = true

    AND EXISTS (
      SELECT 1

      FROM public.team_members current_member

      INNER JOIN public.team_members target_member
        ON target_member.team_id = current_member.team_id

      WHERE current_member.user_id = auth.uid()
        AND target_member.user_id = target_user_id
    );
$$;


-- Nobody receives function access automatically.

REVOKE ALL
ON FUNCTION public.get_shared_team_contact(uuid)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.get_shared_team_contact(uuid)
FROM anon;


-- Only logged-in TeamUp users may call it.

GRANT EXECUTE
ON FUNCTION public.get_shared_team_contact(uuid)
TO authenticated;


COMMIT;