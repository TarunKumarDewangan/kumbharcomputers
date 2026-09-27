import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import type { Invoice } from "@/lib/types";
import { PrintButton } from "./PrintButton";
import { DeleteButton } from "./DeleteButton";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .order("sno", { referencedTable: "invoice_items", ascending: true })
    .single();

  if (error || !data) {
    notFound();
  }

  const invoice = data as unknown as Invoice;

  return (
    <main className="min-h-screen bg-gray-200 py-4 sm:py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <Link href="/" prefetch={false} className="text-sm font-medium text-slate-700 hover:underline">
          ← Back
        </Link>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            href={`/invoices/${id}/edit`}
            prefetch={false}
            className="rounded px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
          >
            Edit
          </Link>
          <DeleteButton invoiceId={id} invoiceNo={invoice.invoice_no} />
          <PrintButton />
        </div>
      </div>

      <p className="mx-auto mb-2 max-w-[210mm] px-4 text-center text-xs text-slate-500 sm:hidden print:hidden">
        Scroll sideways to view the full invoice — it prints correctly on A4.
      </p>
      <div className="overflow-x-auto px-4 print:overflow-visible print:px-0 sm:px-0">
        <InvoiceDocument invoice={invoice} />
      </div>
    </main>
  );
}
