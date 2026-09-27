import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/app/invoices/[id]/DeleteButton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_no, invoice_date, customer_name, customer_phone, customer_address, total_amount")
    .order("invoice_no", { ascending: false })
    .limit(500);

  const invoices = allInvoices ?? [];

  const totalRevenue = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const invoiceCount = invoices.length;
  const latestNo = invoices[0]?.invoice_no;

  const needle = query.toLowerCase();
  const filtered = query
    ? invoices.filter((inv) => {
        return (
          inv.customer_name.toLowerCase().includes(needle) ||
          (inv.customer_phone ?? "").toLowerCase().includes(needle) ||
          (inv.customer_address ?? "").toLowerCase().includes(needle) ||
          String(inv.invoice_no).includes(needle)
        );
      })
    : invoices.slice(0, 50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every product sale entered here generates a print-ready invoice.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Invoices" value={invoiceCount.toString()} />
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        />
        <StatCard label="Latest Invoice No." value={latestNo ? `#${latestNo}` : "—"} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">
            {query ? `Search Results (${filtered.length})` : "Recent Invoices"}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <form action="/" method="GET" className="relative w-full sm:w-auto">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search name, mobile, invoice no..."
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-64"
              />
            </form>
            {query && (
              <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Clear
              </Link>
            )}
            <Link
              href="/invoices/new"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + New Sale
            </Link>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filtered.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <Link href={`/invoices/${inv.id}`} className="min-w-0 sm:flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {inv.customer_name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Invoice #{inv.invoice_no} ·{" "}
                    {new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {inv.customer_phone && ` · ${inv.customer_phone}`}
                  </p>
                </Link>
                <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{Number(inv.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/invoices/${inv.id}/edit`}
                      className="rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    <DeleteButton invoiceId={inv.id} invoiceNo={inv.invoice_no} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : query ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">No invoices match &quot;{query}&quot;</p>
            <p className="text-sm text-slate-500">Try a different name, phone number, or invoice no.</p>
            <Link href="/" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Clear search
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 12h6M9 16h6M9 8h6M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2V4Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">No invoices yet</p>
            <p className="text-sm text-slate-500">Create your first sale entry to get started.</p>
            <Link
              href="/invoices/new"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              + New Sale Entry
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
