import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./DeleteButton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, sku, stock_qty, rate")
    .order("name", { ascending: true })
    .limit(500);

  const products = allProducts ?? [];
  const needle = query.toLowerCase();
  const filtered = query
    ? products.filter(
        (p) => p.name.toLowerCase().includes(needle) || (p.sku ?? "").toLowerCase().includes(needle)
      )
    : products;

  const lowStockCount = products.filter((p) => Number(p.stock_qty) <= 2).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products and current stock on hand. {lowStockCount > 0 && (
              <span className="font-medium text-amber-600">{lowStockCount} low on stock.</span>
            )}
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-block shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Stock Entry
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">
            {query ? `Search Results (${filtered.length})` : `All Products (${products.length})`}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <form action="/products" method="GET" className="relative w-full sm:w-auto">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search product, SKU..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </form>
            {query && (
              <Link href="/products" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Clear
              </Link>
            )}
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const low = Number(p.stock_qty) <= 2;
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                >
                  <div className="min-w-0 sm:flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.sku ? `SKU: ${p.sku} · ` : ""}Rate: ₹
                      {Number(p.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        low ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Stock: {p.stock_qty}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      <DeleteButton productId={p.id} productName={p.name} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              {query ? `No products match "${query}"` : "No products yet"}
            </p>
            <p className="text-sm text-slate-500">
              {query ? "Try a different name or SKU." : "Add your first stock entry to get started."}
            </p>
            <Link
              href={query ? "/products" : "/products/new"}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {query ? "Clear search" : "+ New Stock Entry"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
