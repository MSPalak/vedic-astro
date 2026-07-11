-- TechPandit — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- Everything is protected by Row Level Security: users only ever see their own rows.

-- Saved readings (kundli / match / palm results)
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('kundli', 'match', 'palm')),
  title text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Questions asked to the astrologer, with the answer given
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text not null,
  chart_name text,
  chart_date text,
  created_at timestamptz not null default now()
);

create index if not exists readings_user_created_idx
  on public.readings (user_id, created_at desc);
create index if not exists questions_user_created_idx
  on public.questions (user_id, created_at desc);

alter table public.readings enable row level security;
alter table public.questions enable row level security;

-- Each user reads and writes only their own rows.
create policy "read own readings" on public.readings
  for select using (auth.uid() = user_id);
create policy "insert own readings" on public.readings
  for insert with check (auth.uid() = user_id);
create policy "delete own readings" on public.readings
  for delete using (auth.uid() = user_id);

create policy "read own questions" on public.questions
  for select using (auth.uid() = user_id);
create policy "insert own questions" on public.questions
  for insert with check (auth.uid() = user_id);
create policy "delete own questions" on public.questions
  for delete using (auth.uid() = user_id);
