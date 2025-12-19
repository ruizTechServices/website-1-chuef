-- ============================================
-- MIGRATION 003: User Profiles & Username System
-- ============================================
-- This migration implements:
-- 1. user_profiles table with username + one-time change tracking
-- 2. Dynamic anon# position assignment with recycling
-- 3. Updated chat_messages_with_user view for privacy
-- ============================================

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  username_changed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Username constraints: min 3 chars, max 30 chars
  CONSTRAINT username_length CHECK (
    username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30)
  )
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles (username);

-- ============================================
-- 2. ANON POSITIONS TABLE (for recycling)
-- ============================================
-- Tracks which anon positions are in use
CREATE TABLE IF NOT EXISTS public.anon_positions (
  position INTEGER PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate positions 1-9999 as available (user_id = NULL means available)
-- We'll do this with a function to avoid massive insert statement
CREATE OR REPLACE FUNCTION public.init_anon_positions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.anon_positions (position, user_id)
  SELECT generate_series(1, 9999), NULL
  ON CONFLICT (position) DO NOTHING;
END;
$$;

-- Initialize the positions
SELECT public.init_anon_positions();

-- ============================================
-- 3. FUNCTION: Get or Assign Anon Position
-- ============================================
-- Returns the anon position for a user (assigns one if needed)
CREATE OR REPLACE FUNCTION public.get_anon_position(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position INTEGER;
  v_has_username BOOLEAN;
BEGIN
  -- Check if user has a username (if so, they don't need an anon position)
  SELECT (username IS NOT NULL) INTO v_has_username
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- If user has username, return NULL (they're not anonymous)
  IF v_has_username THEN
    RETURN NULL;
  END IF;
  
  -- Check if user already has an anon position
  SELECT position INTO v_position
  FROM public.anon_positions
  WHERE user_id = p_user_id;
  
  IF v_position IS NOT NULL THEN
    RETURN v_position;
  END IF;
  
  -- Assign the lowest available position
  UPDATE public.anon_positions
  SET user_id = p_user_id, assigned_at = NOW()
  WHERE position = (
    SELECT MIN(position) FROM public.anon_positions WHERE user_id IS NULL
  )
  AND user_id IS NULL
  RETURNING position INTO v_position;
  
  RETURN v_position;
END;
$$;

-- ============================================
-- 4. FUNCTION: Release Anon Position
-- ============================================
-- Called when a user sets a username (releases their anon slot)
CREATE OR REPLACE FUNCTION public.release_anon_position(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.anon_positions
  SET user_id = NULL, assigned_at = NULL
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================
-- 5. FUNCTION: Set Username (One-Time Only)
-- ============================================
CREATE OR REPLACE FUNCTION public.set_username(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_already_changed BOOLEAN;
  v_existing_username TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate username length
  IF p_username IS NULL OR char_length(p_username) < 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username must be at least 3 characters');
  END IF;
  
  IF char_length(p_username) > 30 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username must be 30 characters or less');
  END IF;
  
  -- Check if username is already taken
  SELECT username INTO v_existing_username
  FROM public.user_profiles
  WHERE LOWER(username) = LOWER(p_username) AND id != v_user_id;
  
  IF v_existing_username IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username already taken');
  END IF;
  
  -- Check if user has already changed their username
  SELECT username_changed INTO v_already_changed
  FROM public.user_profiles
  WHERE id = v_user_id;
  
  IF v_already_changed = TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username can only be changed once');
  END IF;
  
  -- Upsert the profile with username
  INSERT INTO public.user_profiles (id, username, username_changed, updated_at)
  VALUES (v_user_id, p_username, TRUE, NOW())
  ON CONFLICT (id) DO UPDATE SET
    username = p_username,
    username_changed = TRUE,
    updated_at = NOW();
  
  -- Release their anon position (slot becomes available)
  PERFORM public.release_anon_position(v_user_id);
  
  RETURN jsonb_build_object('success', true, 'username', p_username);
END;
$$;

-- ============================================
-- 6. FUNCTION: Get Display Name
-- ============================================
-- Returns username if set, otherwise anon#XXXX
CREATE OR REPLACE FUNCTION public.get_display_name(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_position INTEGER;
BEGIN
  -- Check for username first
  SELECT username INTO v_username
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  IF v_username IS NOT NULL THEN
    RETURN v_username;
  END IF;
  
  -- Get or assign anon position
  v_position := public.get_anon_position(p_user_id);
  
  IF v_position IS NOT NULL THEN
    RETURN 'anon#' || LPAD(v_position::TEXT, 4, '0');
  END IF;
  
  -- Fallback (should rarely happen)
  RETURN 'anon#????';
END;
$$;

-- ============================================
-- 7. TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile entry for new user
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign them an anon position
  PERFORM public.get_anon_position(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. BACKFILL: Create profiles for existing users
-- ============================================
-- Create profiles for any existing users
INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Assign anon positions to existing users without usernames
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT up.id 
    FROM public.user_profiles up
    WHERE up.username IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.anon_positions ap WHERE ap.user_id = up.id)
    ORDER BY up.created_at
  LOOP
    PERFORM public.get_anon_position(r.id);
  END LOOP;
END;
$$;

-- ============================================
-- 9. UPDATE VIEW: chat_messages_with_user
-- ============================================
-- Replace the view to use new display name logic
DROP VIEW IF EXISTS public.chat_messages_with_user;

CREATE VIEW public.chat_messages_with_user AS
SELECT 
  cm.id,
  cm.input_id,
  cm.user_id,
  cm.room,
  cm.text,
  cm.created_at,
  public.get_display_name(cm.user_id) AS display_name,
  u.raw_user_meta_data->>'avatar_url' AS avatar_url
FROM public.chat_messages cm
LEFT JOIN auth.users u ON cm.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON public.chat_messages_with_user TO anon, authenticated;

-- ============================================
-- 10. RLS POLICIES FOR USER_PROFILES
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read display info (username only) of others
CREATE POLICY "Public can read usernames"
  ON public.user_profiles FOR SELECT
  USING (true);

-- Users can update their own profile (but set_username function enforces one-time rule)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 11. RLS POLICIES FOR ANON_POSITIONS
-- ============================================
ALTER TABLE public.anon_positions ENABLE ROW LEVEL SECURITY;

-- Only service role can directly modify anon_positions
-- Functions use SECURITY DEFINER to bypass RLS

-- Allow reading for display purposes
CREATE POLICY "Public can read anon positions"
  ON public.anon_positions FOR SELECT
  USING (true);

-- ============================================
-- 12. GRANT FUNCTION PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_anon_position(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_anon_position(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_display_name(UUID) TO anon, authenticated;

