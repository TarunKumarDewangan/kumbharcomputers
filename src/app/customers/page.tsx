import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./DeleteButton";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const { data: allCustomers } = await supabase
    .from("customers")
    .select("id, name, phone, address, created_at")
    .order("name", { ascending: true })
    .limit(500);

  const customers = allCustomers ?? [];
  const needle = query.toLowerCase();
  const filtered = query
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          (c.phone ?? "").toLowerCase().includes(needle) ||
          (c.address ?? "").toLowerCase().includes(needle)
      )
    : customers;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Saved customers appear as suggestions when creating a new sale.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">
            {query ? `Search Results (${filtered.length})` : `All Customers (${customers.length})`}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <form action="/customers" method="GET" className="relative w-full sm:w-auto">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search name, phone..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </form>
            {query && (
              <Link href="/customers" prefetch={false} className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Clear
              </Link>
            )}
            <Link
              href="/customers/new"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + Add Customer
            </Link>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <div className="min-w-0 sm:flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[c.phone, c.address].filter(Boolean).join(" · ") || "No contact details"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                  <Link
                    href={`/customers/${c.id}/edit`}
                    prefetch={false}
                    className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <DeleteButton customerId={c.id} customerName={c.name} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              {query ? `No customers match "${query}"` : "No customers yet"}
            </p>
            <p className="text-sm text-slate-500">
              {query ? "Try a different name or phone number." : "Add your first customer to get started."}
            </p>
            <Link
              href={query ? "/customers" : "/customers/new"}
              prefetch={!query}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {query ? "Clear search" : "+ Add Customer"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
