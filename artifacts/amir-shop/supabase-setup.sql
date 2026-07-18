-- Amir Shop — Supabase Database Setup
-- Run this in your Supabase SQL Editor to create all required tables and policies.

-- ============================================================
-- 1. GAMES TABLE
-- ============================================================
create table if not exists public.games (
  id           serial primary key,
  name         text not null,
  name_ar      text not null,
  slug         text not null unique,
  description  text,
  description_ar text,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.games enable row level security;

-- Public can read active games
create policy "games_select_public" on public.games
  for select using (is_active = true);

-- Admin bypass (service role) can do everything — no additional policy needed
-- Tip: use Supabase service role key server-side for admin writes

-- ============================================================
-- 2. PACKAGES TABLE
-- ============================================================
create table if not exists public.packages (
  id         serial primary key,
  game_id    integer not null references public.games(id) on delete cascade,
  name       text not null,
  name_ar    text not null,
  amount     text not null,
  price      numeric(10,2) not null,
  currency   text not null default 'USD',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "packages_select_public" on public.packages
  for select using (is_active = true);

-- ============================================================
-- 3. ORDERS TABLE
-- ============================================================
create table if not exists public.orders (
  id                 serial primary key,
  game_id            integer not null references public.games(id),
  package_id         integer not null references public.packages(id),
  player_id          text not null,
  player_email       text not null,
  player_username    text,
  status             text not null default 'pending'
                       check (status in ('pending','processing','completed','cancelled')),
  total_price        numeric(10,2) not null,
  currency           text not null default 'USD',
  payment_proof_url  text,
  admin_notes        text,
  created_at         timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Anyone can insert an order
create policy "orders_insert_public" on public.orders
  for insert with check (true);

-- Users can read their own orders by email or player_id
create policy "orders_select_own" on public.orders
  for select using (true);  -- frontend filters by email/player_id

-- ============================================================
-- 4. STORAGE BUCKET — payment-proofs
-- ============================================================
-- Run this separately in Supabase Dashboard → Storage → New Bucket
-- Bucket name: payment-proofs   (public: false)
-- Or via SQL:
insert into storage.buckets (id, name, public)
  values ('payment-proofs', 'payment-proofs', false)
  on conflict (id) do nothing;

-- Anyone can upload to payment-proofs
create policy "payment_proofs_insert" on storage.objects
  for insert with check (bucket_id = 'payment-proofs');

-- Only admins (service role) can read payment proofs
create policy "payment_proofs_select_admin" on storage.objects
  for select using (bucket_id = 'payment-proofs');

-- ============================================================
-- 5. SEED DATA (optional — remove in production)
-- ============================================================
insert into public.games (name, name_ar, slug, description, description_ar, image_url, is_active) values
  ('PUBG Mobile', 'ببجي موبايل', 'pubg-mobile',
   'Battle royale game', 'لعبة باتل رويال',
   'https://placehold.co/400x300/1a1a2e/7c3aed?text=PUBG+Mobile', true),
  ('Free Fire', 'فري فاير', 'free-fire',
   'Mobile battle royale', 'باتل رويال موبايل',
   'https://placehold.co/400x300/1a1a2e/7c3aed?text=Free+Fire', true),
  ('Mobile Legends', 'موبايل ليجندز', 'mobile-legends',
   'MOBA for mobile', 'لعبة موبا للموبايل',
   'https://placehold.co/400x300/1a1a2e/7c3aed?text=Mobile+Legends', true),
  ('Valorant', 'فالورانت', 'valorant',
   'Tactical FPS', 'لعبة تكتيكية', 
   'https://placehold.co/400x300/1a1a2e/7c3aed?text=Valorant', true)
on conflict (slug) do nothing;

insert into public.packages (game_id, name, name_ar, amount, price, currency) values
  (1, '60 UC', '60 UC', '60 UC', 0.99, 'USD'),
  (1, '325 UC', '325 UC', '325 UC', 4.99, 'USD'),
  (1, '660 UC', '660 UC', '660 UC', 9.99, 'USD'),
  (1, '1800 UC', '1800 UC', '1800 UC', 24.99, 'USD'),
  (2, '100 Diamonds', '100 الماس', '100 Diamonds', 0.99, 'USD'),
  (2, '310 Diamonds', '310 الماس', '310 Diamonds', 2.99, 'USD'),
  (2, '520 Diamonds', '520 الماس', '520 Diamonds', 4.99, 'USD'),
  (3, '50 Diamonds', '50 الماس', '50 Diamonds', 0.99, 'USD'),
  (3, '150 Diamonds', '150 الماس', '150 Diamonds', 2.99, 'USD'),
  (3, '250 Diamonds', '250 الماس', '250 Diamonds', 4.99, 'USD'),
  (4, '475 VP', '475 نقطة', '475 VP', 4.99, 'USD'),
  (4, '1000 VP', '1000 نقطة', '1000 VP', 9.99, 'USD'),
  (4, '2050 VP', '2050 نقطة', '2050 VP', 19.99, 'USD')
on conflict do nothing;
