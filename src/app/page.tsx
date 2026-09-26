import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_no, invoice_date, customer_name, total_amount")
    .order("invoice_no", { ascending: false })
    .limit(50);

  const totalRevenue = (invoices ?? []).reduce((s, i) => s + Number(i.total_amount), 0);
  const invoiceCount = invoices?.length ?? 0;
  const latestNo = invoices?.[0]?.invoice_no;

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
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Recent Invoices</h2>
          <Link
            href="/invoices/new"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            + New Sale
          </Link>
        </div>

        {invoices && invoices.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
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
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    ₹{Number(inv.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
