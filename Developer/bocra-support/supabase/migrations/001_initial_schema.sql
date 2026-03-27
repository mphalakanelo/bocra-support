-- ═══════════════════════════════════════════════════════
-- BOCRA Support Centre — Supabase Database Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor)
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  phone       text,
  national_id text,
  district    text,
  address     text,
  role        text not null default 'citizen' check (role in ('citizen','agent','admin')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Agents and admins can read all profiles"
  on public.profiles for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('agent','admin')
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- COMPLAINTS
-- ─────────────────────────────────────────────
create table public.complaints (
  id               uuid default uuid_generate_v4() primary key,
  reference_number text unique not null,
  user_id          uuid references public.profiles(id) on delete set null,

  -- Complainant details (stored separately in case anonymous)
  complainant_name text not null,
  phone            text not null,
  email            text,
  national_id      text,
  district         text,
  address          text,

  -- Complaint details
  operator         text not null,
  category         text not null,
  description      text not null,
  date_started     date not null,
  account_number   text,
  prior_contact    text,
  resolution_sought text,

  -- Status tracking
  status           text not null default 'submitted'
                   check (status in ('submitted','acknowledged','investigating','resolved','closed')),
  assigned_to      uuid references public.profiles(id) on delete set null,
  priority         text default 'normal' check (priority in ('low','normal','high','urgent')),

  -- Internal notes
  internal_notes   text,
  resolution_notes text,

  -- Timestamps
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  resolved_at      timestamptz
);

alter table public.complaints enable row level security;

-- Citizens can read own complaints
create policy "Citizens read own complaints"
  on public.complaints for select
  using (user_id = auth.uid());

-- Citizens can create complaints
create policy "Citizens create complaints"
  on public.complaints for insert
  with check (true); -- Allow anonymous filing too

-- Agents/admins can read all complaints
create policy "Agents read all complaints"
  on public.complaints for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('agent','admin')
    )
  );

-- Agents/admins can update complaints
create policy "Agents update complaints"
  on public.complaints for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('agent','admin')
    )
  );

-- Auto-generate reference number
create or replace function generate_complaint_reference()
returns trigger language plpgsql as $$
begin
  new.reference_number := 'BCR-' ||
    to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  return new;
end;
$$;

create trigger set_complaint_reference
  before insert on public.complaints
  for each row execute function generate_complaint_reference();

-- updated_at trigger
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger complaints_updated_at
  before update on public.complaints
  for each row execute function update_updated_at_column();

-- ─────────────────────────────────────────────
-- COMPLAINT ATTACHMENTS
-- ─────────────────────────────────────────────
create table public.complaint_attachments (
  id           uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  file_name    text not null,
  file_size    bigint not null,
  file_type    text not null,
  storage_path text not null,
  uploaded_at  timestamptz default now()
);

alter table public.complaint_attachments enable row level security;

create policy "Users can read own complaint attachments"
  on public.complaint_attachments for select
  using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.user_id = auth.uid()
    )
  );

create policy "Anyone can insert attachments"
  on public.complaint_attachments for insert with check (true);

-- ─────────────────────────────────────────────
-- COMPLAINT STATUS HISTORY
-- ─────────────────────────────────────────────
create table public.complaint_history (
  id           uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  changed_by   uuid references public.profiles(id) on delete set null,
  from_status  text,
  to_status    text not null,
  note         text,
  created_at   timestamptz default now()
);

alter table public.complaint_history enable row level security;

create policy "Users read own complaint history"
  on public.complaint_history for select
  using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_id and c.user_id = auth.uid()
    )
  );

create policy "Agents read all history"
  on public.complaint_history for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('agent','admin')
    )
  );

-- ─────────────────────────────────────────────
-- LIVE CHAT SESSIONS
-- ─────────────────────────────────────────────
create table public.chat_sessions (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete set null,
  agent_id     uuid references public.profiles(id) on delete set null,
  status       text not null default 'queued'
               check (status in ('queued','active','closed','abandoned')),
  queue_position int,
  session_type text default 'live' check (session_type in ('live','ai')),
  started_at   timestamptz default now(),
  connected_at timestamptz,
  ended_at     timestamptz,
  rating       int check (rating between 1 and 5),
  feedback     text
);

alter table public.chat_sessions enable row level security;

create policy "Users read own sessions"
  on public.chat_sessions for select using (user_id = auth.uid());

create policy "Agents read own assigned sessions"
  on public.chat_sessions for select
  using (agent_id = auth.uid() or
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Anyone can create session"
  on public.chat_sessions for insert with check (true);

create policy "Users update own sessions"
  on public.chat_sessions for update using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────────
create table public.chat_messages (
  id         uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  sender_id  uuid references public.profiles(id) on delete set null,
  role       text not null check (role in ('user','agent','ai','system')),
  content    text not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Session participants can read messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and (s.user_id = auth.uid() or s.agent_id = auth.uid())
    )
  );

create policy "Anyone can insert messages"
  on public.chat_messages for insert with check (true);

-- Enable realtime for live chat
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_sessions;

-- ─────────────────────────────────────────────
-- KNOWLEDGE BASE ARTICLES
-- ─────────────────────────────────────────────
create table public.kb_categories (
  id          uuid default uuid_generate_v4() primary key,
  slug        text unique not null,
  icon        text not null,
  title       text not null,
  description text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create table public.kb_articles (
  id          uuid default uuid_generate_v4() primary key,
  category_id uuid references public.kb_categories(id) on delete cascade not null,
  slug        text unique not null,
  title       text not null,
  body        text not null, -- HTML content
  tags        text[] default '{}',
  source_ref  text,
  published   boolean default true,
  view_count  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  created_by  uuid references public.profiles(id) on delete set null
);

alter table public.kb_categories enable row level security;
alter table public.kb_articles enable row level security;

-- Public read
create policy "Anyone can read published categories"
  on public.kb_categories for select using (true);

create policy "Anyone can read published articles"
  on public.kb_articles for select using (published = true);

-- Admin/agents can manage KB
create policy "Admins manage categories"
  on public.kb_categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('agent','admin')));

create policy "Admins manage articles"
  on public.kb_articles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('agent','admin')));

create trigger kb_articles_updated_at
  before update on public.kb_articles
  for each row execute function update_updated_at_column();

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('complaint-attachments', 'complaint-attachments', false);

create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  with check (bucket_id = 'complaint-attachments');

create policy "Users can read own attachments"
  on storage.objects for select
  using (bucket_id = 'complaint-attachments' and auth.uid() is not null);

-- ─────────────────────────────────────────────
-- SEED: KB CATEGORIES
-- ─────────────────────────────────────────────
insert into public.kb_categories (slug, icon, title, description, sort_order) values
  ('billing',    '💳', 'Billing & Charges',    'Disputes, unauthorized charges, refunds',       1),
  ('coverage',   '📡', 'Network Coverage',     'Signal issues, rural connectivity',             2),
  ('procedures', '📋', 'Complaint Procedures', 'How to file and track BOCRA complaints',        3),
  ('operators',  '📱', 'Licensed Operators',   'Botswana telecoms, ISPs, and broadcasters',     4),
  ('rights',     '⚖️', 'Consumer Rights',      'Your rights under Botswana law',                5),
  ('regulations','📜', 'Regulations',          'Telecom Act, BOCRA directives, data protection',6),
  ('faqs',       '❓', 'FAQs',                 'Frequently asked questions',                    7);
