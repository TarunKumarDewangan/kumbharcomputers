-- Run this once in the Supabase SQL editor for the live project.
-- Adds a separate "amount actually paid" section to each purchase order, with an
-- optional GST breakdown (5% / 12% / 18%) independent of the item list's own total.

alter table public.purchase_orders
  add column if not exists gst_applicable boolean not null default false,
  add column if not exists gst_percent numeric(5, 2),
  add column if not exists paid_amount numeric(12, 2) not null default 0,
  add column if not exists taxable_amount numeric(12, 2),
  add column if not exists gst_amount numeric(12, 2);
