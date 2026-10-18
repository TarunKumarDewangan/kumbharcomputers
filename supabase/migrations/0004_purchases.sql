-- Run this once in the Supabase SQL editor for the live project.
-- A simple purchase ledger: what was bought, when, how much, and the total paid.

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_date date not null default current_date,
  product_name text not null,
  description text,
  quantity numeric(12, 2) not null default 1,
  total_price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchases_product_name_idx on public.purchases (lower(product_name));
create index if not exists purchases_purchase_date_idx on public.purchases (purchase_date);

alter table public.purchases enable row level security;
create policy "allow all on purchases" on public.purchases for all using (true) with check (true);
