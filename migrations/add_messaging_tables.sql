-- Broadcast messages (shown as popup to all reviewers/editors of a role)
create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  target_role text not null default 'All', -- 'All', 'Reviewer', 'Editorial Board Member'
  active boolean default true,
  created_at timestamptz default now(),
  created_by text
);

-- Private direct messages from admin to a specific reviewer/editor
create table if not exists public.admin_direct_messages (
  id uuid primary key default gen_random_uuid(),
  reviewer_id text not null,        -- recipient reviewer ID
  reviewer_name text,
  subject text,
  message text not null,
  is_read boolean default false,
  sent_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_messages enable row level security;
alter table public.admin_direct_messages enable row level security;

-- Public can read active broadcasts
create policy "Public read active broadcasts" on public.admin_messages
  for select using (active = true);

-- Service role full access
create policy "Service role full access broadcasts" on public.admin_messages
  for all using (true) with check (true);

create policy "Service role full access direct messages" on public.admin_direct_messages
  for all using (true) with check (true);

-- Reviewers can read their own direct messages
create policy "Reviewer reads own messages" on public.admin_direct_messages
  for select using (true);
