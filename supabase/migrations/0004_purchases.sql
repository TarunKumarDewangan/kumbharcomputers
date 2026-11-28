-- Run this once in the Supabase SQL editor for the live project.
-- A purchase order: one order (date + notes) made up of multiple line items
-- (product, quantity, unit price), mirroring the invoices / invoice_items shape.

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  purchase_date date not null default current_date,
  notes text,
  total_price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchase_orders_purchase_date_idx on public.purchase_orders (purchase_date);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  sno integer not null,
  product_name text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  amount numeric(12, 2) generated always as (quantity * unit_price) stored
);

create index if not exists purchase_items_order_id_idx on public.purchase_items (purchase_order_id);
create index if not exists purchase_items_product_name_idx on public.purchase_items (lower(product_name));

alter table public.purchase_orders enable row level security;
alter table public.purchase_items enable row level security;

create policy "allow all on purchase_orders" on public.purchase_orders for all using (true) with check (true);
create policy "allow all on purchase_items" on public.purchase_items for all using (true) with check (true);
