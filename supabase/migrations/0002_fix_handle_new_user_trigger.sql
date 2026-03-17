-- Fix: handle_new_user trigger fails on email unique constraint violation
-- Cause: ON CONFLICT (id) only handles PK conflicts, not email unique index
-- Solution: use ON CONFLICT DO NOTHING (handles all unique constraints)
--           + add EXCEPTION handler as safety net

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict do nothing;  -- handles ALL unique constraint violations (id, email, etc.)

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict do nothing;

  return new;
exception
  when others then
    -- never block user creation even if profile insert fails
    raise warning 'handle_new_user error for user %: %', new.id, sqlerrm;
    return new;
end;
$$;
