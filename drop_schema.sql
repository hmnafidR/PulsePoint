-- Drop policies if they exist
do $$ 
begin
  if exists (select 1 from pg_policies where tablename = 'users') then
    drop policy if exists "Users can view their own data" on public.users;
    drop policy if exists "Users can update their own data" on public.users;
  end if;
  
  if exists (select 1 from pg_policies where tablename = 'meetings') then
    drop policy if exists "Users can view their own meetings" on public.meetings;
    drop policy if exists "Users can create their own meetings" on public.meetings;
    drop policy if exists "Users can update their own meetings" on public.meetings;
    drop policy if exists "Users can delete their own meetings" on public.meetings;
  end if;
end $$;

-- Drop triggers if they exist
do $$ 
begin
  if exists (select 1 from pg_trigger where tgname = 'handle_meetings_updated_at') then
    drop trigger if exists handle_meetings_updated_at on public.meetings;
  end if;
  
  if exists (select 1 from pg_trigger where tgname = 'handle_users_updated_at') then
    drop trigger if exists handle_users_updated_at on public.users;
  end if;
  
  if exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    drop trigger if exists on_auth_user_created on auth.users;
  end if;
end $$;

-- Drop functions if they exist
drop function if exists public.calculate_meeting_stats(uuid);
drop function if exists public.handle_updated_at();
drop function if exists public.handle_new_user();

-- Drop types if they exist
drop type if exists public.sentiment_type;

-- Drop tables if they exist
drop table if exists public.meetings;
drop table if exists public.users; 