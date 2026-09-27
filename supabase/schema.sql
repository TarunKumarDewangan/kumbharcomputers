-- Kumbhakar Computer — sales invoice schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no integer not null unique,
  invoice_date date not null default current_date,
  customer_name text not null,
  customer_phone text,
  customer_address text,
  order_no text,
  terms_of_payment text,
  amount_in_words text,
  total_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Invoice numbers continue on from the last paper invoice (537).
create sequence if not exists public.invoice_no_seq owned by public.invoices.invoice_no start with 538;
alter table public.invoices alter column invoice_no set default nextval('public.invoice_no_seq');

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  sno integer not null,
  description text not null,
  item_serial text,
  qty numeric(12, 2) not null default 1,
  rate numeric(12, 2) not null default 0,
  amount numeric(12, 2) generated always as (qty * rate) stored
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- Row Level Security: allow the single business user (via anon key) to read/write.
-- Tighten this once auth is added; for now the app is single-tenant / internal use.
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create policy "allow all on invoices" on public.invoices for all using (true) with check (true);
create policy "allow all on invoice_items" on public.invoice_items for all using (true) with check (true);

-- Customers directory (used for the sales-form autocomplete).
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

-- Products / stock module.
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
