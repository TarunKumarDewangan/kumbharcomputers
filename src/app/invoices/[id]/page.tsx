import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import type { Invoice } from "@/lib/types";
import { PrintButton } from "./PrintButton";

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back to invoices
        </Link>
        <PrintButton />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none sm:p-10">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
