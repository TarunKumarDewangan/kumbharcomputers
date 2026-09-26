-- Run this once in the Supabase SQL editor for the live project.
-- The invoice design was simplified (dropped despatch/supplier-ref fields,
-- added a "Bill To" address line). Old columns are left in place — harmless,
-- just unused — so this migration only adds the new one.

alter table public.invoices add column if not exists customer_address text;
