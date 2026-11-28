import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./DeleteButton";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const { data: allPurchases } = await supabase
    .from("purchase_orders")
    .select(
      "id, purchase_date, notes, total_price, paid_amount, gst_applicable, gst_percent, purchase_items(product_name)"
    )
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const purchases = allPurchases ?? [];
  const totalSpent = purchases.reduce((s, p) => s + Number(p.paid_amount || p.total_price), 0);

  const needle = query.toLowerCase();
  const filtered = query
    ? purchases.filter(
        (p) =>
          p.purchase_items.some((i) => i.product_name.toLowerCase().includes(needle)) ||
          (p.notes ?? "").toLowerCase().includes(needle)
      )
    : purchases;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchases</h1>
          <p className="mt-1 text-sm text-slate-500">What you've bought — date, item, quantity and cost.</p>
        </div>
        <Link
          href="/purchases/new"
          className="inline-block shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Purchase
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Purchases" value={purchases.length.toString()} />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">
            {query ? `Search Results (${filtered.length})` : `All Purchases (${purchases.length})`}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <form action="/purchases" method="GET" className="relative w-full sm:w-auto">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search product, notes..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </form>
            {query && (
              <Link href="/purchases" prefetch={false} className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Clear
              </Link>
            )}
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const itemNames = p.purchase_items.map((i) => i.product_name);
              const summary =
                itemNames.length > 2
                  ? `${itemNames.slice(0, 2).join(", ")} +${itemNames.length - 2} more`
                  : itemNames.join(", ") || "No items";
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                >
                  <div className="min-w-0 sm:flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{summary}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(p.purchase_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {itemNames.length} item{itemNames.length === 1 ? "" : "s"}
                      {p.notes && ` · ${p.notes}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                    <span className="text-sm font-semibold text-slate-900">
                      ₹{Number(p.paid_amount || p.total_price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                      {p.gst_applicable && p.gst_percent && (
                        <span className="ml-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                          GST {p.gst_percent}%
                        </span>
                      )}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/purchases/${p.id}/edit`}
                        prefetch={false}
                        className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton purchaseId={p.id} label={summary} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              {query ? `No purchases match "${query}"` : "No purchases yet"}
            </p>
            <p className="text-sm text-slate-500">
              {query ? "Try a different product name." : "Log your first purchase to get started."}
            </p>
            <Link
              href={query ? "/purchases" : "/purchases/new"}
              prefetch={!query}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {query ? "Clear search" : "+ New Purchase"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
