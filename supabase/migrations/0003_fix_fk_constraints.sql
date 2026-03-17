-- Fix: ensure user_profiles and user_preferences both have correct FK to auth.users
-- If user_profiles was created before migration (IF NOT EXISTS skipped it),
-- the FK to auth.users may be missing.

-- Add FK to user_profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_profiles'::regclass
      AND contype = 'f'
      AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added FK constraint to user_profiles';
  ELSE
    RAISE NOTICE 'user_profiles FK already exists';
  END IF;
END $$;

-- Add FK to user_preferences if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_preferences'::regclass
      AND contype = 'f'
      AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE public.user_preferences
      ADD CONSTRAINT user_preferences_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added FK constraint to user_preferences';
  ELSE
    RAISE NOTICE 'user_preferences FK already exists';
  END IF;
END $$;

-- Clean up orphaned rows in user_profiles/user_preferences that have no auth.users match
DELETE FROM public.user_preferences
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_profiles
WHERE id NOT IN (SELECT id FROM auth.users);
