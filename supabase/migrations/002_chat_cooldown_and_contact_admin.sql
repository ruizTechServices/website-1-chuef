-- ============================================
-- MIGRATION 002: Chat Cooldown + Admin Contact Reads
-- ============================================
-- This migration enforces:
-- 1. 30-second chat cooldown at DB layer (RLS)
-- 2. Admin-only reads for contact_submissions
-- ============================================

-- ============================================
-- 1. CHAT COOLDOWN FUNCTION
-- ============================================
-- Returns TRUE if user can post (no message in last 30 seconds)
-- This is the SOURCE OF TRUTH for rate limiting, not in-memory

CREATE OR REPLACE FUNCTION public.can_post_chat(p_user_id uuid, p_room text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  last_post_time timestamptz;
BEGIN
  -- Get the most recent message time for this user in this room
  SELECT max(created_at) INTO last_post_time
  FROM public.chat_messages
  WHERE user_id = p_user_id AND room = p_room;
  
  -- If no previous post, allow
  IF last_post_time IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if 30 seconds have passed
  RETURN (now() - last_post_time) >= interval '30 seconds';
END;
$$;

-- ============================================
-- 2. UPDATE CHAT_MESSAGES RLS POLICIES
-- ============================================

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Auth users can insert own chat messages" ON public.chat_messages;

-- Create new INSERT policy with cooldown enforcement
CREATE POLICY "Auth users can insert with cooldown"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND room = 'lobby'
    AND public.can_post_chat(auth.uid(), room)
  );

-- ============================================
-- 3. ADMIN ROLE CHECK FUNCTION
-- ============================================
-- Checks if current user has admin role in app_metadata

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$;

-- ============================================
-- 4. UPDATE CONTACT_SUBMISSIONS RLS POLICIES
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policy
DROP POLICY IF EXISTS "Anyone can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can read contact submissions" ON public.contact_submissions;

-- Create admin-only SELECT policy
CREATE POLICY "Admin can read contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (public.is_admin());

-- Ensure INSERT policy exists for public submissions
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;

CREATE POLICY "Anyone can insert contact submissions"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 5. GRANT EXECUTE PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.can_post_chat(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
