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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to invoices
        </Link>
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
