-- Run this once in the Supabase SQL editor for the live project.
-- Adds a customers directory (for the sales-form autocomplete) and a
-- simple products/stock module with an audit trail of stock entries.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create index if not exists customers_name_idx on public.customers (lower(name));

alter table public.customers enable row level security;
create policy "allow all on customers" on public.customers for all using (true) with check (true);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  stock_qty numeric(12, 2) not null default 0,
  rate numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_name_idx on public.products (lower(name));

alter table public.products enable row level security;
create policy "allow all on products" on public.products for all using (true) with check (true);

create table if not exists public.stock_entries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  qty numeric(12, 2) not null,
  rate numeric(12, 2),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists stock_entries_product_id_idx on public.stock_entries (product_id);

alter table public.stock_entries enable row level security;
create policy "allow all on stock_entries" on public.stock_entries for all using (true) with check (true);
