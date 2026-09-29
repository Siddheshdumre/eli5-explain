-- ============================================
-- ELI5 Universe Builder — Supabase schema
-- Run once in Supabase Dashboard > SQL Editor.
-- ============================================

-- Chat threads (one per conversation)
create table if not exists public.chat_threads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null default 'New chat',
    created_at timestamptz not null default now()
);

-- Messages inside a thread
create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references public.chat_threads(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz not null default now()
);

create index if not exists chat_threads_user_id_idx on public.chat_threads(user_id, created_at desc);
create index if not exists chat_messages_thread_id_idx on public.chat_messages(thread_id, created_at);

-- User profile (Profile page)
create table if not exists public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    profession text,
    interests text,
    updated_at timestamptz not null default now()
);

-- ============================================
-- Row Level Security: users only see their own data
-- ============================================
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "own threads" on public.chat_threads;
create policy "own threads" on public.chat_threads
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own messages" on public.chat_messages;
create policy "own messages" on public.chat_messages
    for all
    using (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid()))
    with check (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid()));

drop policy if exists "own profile" on public.user_profiles;
create policy "own profile" on public.user_profiles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
