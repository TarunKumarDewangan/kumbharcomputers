import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COMPANY } from "@/lib/company";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_no, invoice_date, customer_name, total_amount")
    .order("invoice_no", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{COMPANY.name}</h1>
          <p className="text-sm text-gray-500">{COMPANY.city} — Sales Invoices</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + New Sale Entry
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Invoice No</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link href={`/invoices/${inv.id}`} className="font-medium hover:underline">
                    #{inv.invoice_no}
                  </Link>
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {new Date(inv.invoice_date).toLocaleDateString("en-IN")}
                </td>
                <td className="px-3 py-2">{inv.customer_name}</td>
                <td className="px-3 py-2 text-right">
                  ₹{Number(inv.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                  No invoices yet. Create your first sale entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
