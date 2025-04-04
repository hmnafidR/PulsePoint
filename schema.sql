BEGIN;

-- Drop existing objects if they exist (in correct dependency order)
-- First drop policies
drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Users can update their own data" on public.users;
drop policy if exists "Users can view their own meetings" on public.meetings;
drop policy if exists "Users can create their own meetings" on public.meetings;
drop policy if exists "Users can update their own meetings" on public.meetings;
drop policy if exists "Users can delete their own meetings" on public.meetings;

-- Then drop triggers
drop trigger if exists handle_meetings_updated_at on public.meetings;
drop trigger if exists handle_users_updated_at on public.users;
drop trigger if exists on_auth_user_created on auth.users;

-- Then drop functions
drop function if exists public.calculate_meeting_stats(uuid);
drop function if exists public.handle_updated_at();
drop function if exists public.handle_new_user();

-- Then drop types
drop type if exists public.sentiment_type;

-- Finally drop tables
drop table if exists public.meetings;
drop table if exists public.users;

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.meetings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date timestamp with time zone not null,
  participants text[] not null,
  transcript text,
  sentiment_analysis jsonb,
  meeting_link text,
  created_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists meetings_created_by_idx on public.meetings(created_by);
create index if not exists meetings_date_idx on public.meetings(date);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.meetings enable row level security;

-- Create policies for users table
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Create policies for meetings table
create policy "Users can view their own meetings"
  on public.meetings for select
  using (auth.uid() = created_by);

create policy "Users can create their own meetings"
  on public.meetings for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own meetings"
  on public.meetings for update
  using (auth.uid() = created_by);

create policy "Users can delete their own meetings"
  on public.meetings for delete
  using (auth.uid() = created_by);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.handle_updated_at();

-- Create types for sentiment analysis
create type sentiment_type as enum ('positive', 'negative', 'neutral');

-- Create function to calculate meeting statistics
create or replace function public.calculate_meeting_stats(meeting_id uuid)
returns jsonb as $$
declare
  stats jsonb;
begin
  select jsonb_build_object(
    'total_participants', array_length(participants, 1),
    'duration', extract(epoch from (date + interval '1 hour' - date)),
    'sentiment_distribution', (
      select jsonb_object_agg(
        sentiment_type,
        count(*)
      )
      from jsonb_array_elements_text(sentiment_analysis->'participant_sentiments') as sentiment_type
    )
  )
  into stats
  from public.meetings
  where id = meeting_id;
  
  return stats;
end;
$$ language plpgsql security definer;

COMMIT;

BEGIN;
-- Run just the CREATE statements
COMMIT; 