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
    <main className="min-h-screen bg-gray-200 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <Link href="/" className="text-sm font-medium text-slate-700 hover:underline">
          ← Back to invoices
        </Link>
        <PrintButton />
      </div>

      <InvoiceDocument invoice={invoice} />
    </main>
  );
}
