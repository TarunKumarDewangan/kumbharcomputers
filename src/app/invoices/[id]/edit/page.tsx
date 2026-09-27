import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/InvoiceForm";
import type { Invoice } from "@/lib/types";

export default async function EditInvoicePage({
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Invoice #{invoice.invoice_no}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Update the customer and items, then save.</p>
        </div>
        <Link
          href={`/invoices/${id}`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back to invoice
        </Link>
      </div>
      <InvoiceForm
        mode="edit"
        invoiceId={id}
        initialValues={{
          invoiceDate: invoice.invoice_date,
          customerName: invoice.customer_name,
          customerPhone: invoice.customer_phone ?? "",
          customerAddress: invoice.customer_address ?? "",
          orderNo: invoice.order_no ?? "",
          termsOfPayment: invoice.terms_of_payment ?? "",
          items: invoice.invoice_items.map((item) => ({
            description: item.description,
            item_serial: item.item_serial ?? "",
            qty: item.qty,
            rate: item.rate,
          })),
        }}
      />
    </div>
  );
}
