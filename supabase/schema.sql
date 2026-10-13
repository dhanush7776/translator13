-- ═══════════════════════════════════════════════════════════
--  AccessAI — Supabase Schema
--  Run this in your Supabase project:
--  Dashboard → SQL Editor → New query → paste → Run
-- ═══════════════════════════════════════════════════════════

-- 1. Chat history table (stores JARVIS conversation messages)
create table if not exists chat_history (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null,
  role        text        not null check (role in ('user', 'assistant')),
  content     text        not null,
  language    text        not null default 'english',
  created_at  timestamptz not null default now()
);

-- Index for fast session lookups
create index if not exists idx_chat_history_session
  on chat_history (session_id, created_at asc);

-- 2. Usage stats table (logs every tool invocation)
create table if not exists usage_stats (
  id          uuid        primary key default gen_random_uuid(),
  tool        text        not null check (tool in ('simplify', 'translate', 'stt', 'tts', 'jarvis')),
  language    text,
  created_at  timestamptz not null default now()
);

-- Index for analytics queries
create index if not exists idx_usage_stats_tool
  on usage_stats (tool, created_at desc);

-- 3. Row Level Security (RLS) — allow anon key to read/write
alter table chat_history enable row level security;
alter table usage_stats  enable row level security;

-- Allow all operations with anon key (no auth in this app)
create policy "allow anon all on chat_history"
  on chat_history for all
  using (true)
  with check (true);

create policy "allow anon all on usage_stats"
  on usage_stats for all
  using (true)
  with check (true);
