import Link from "next/link";
import { InvoiceForm } from "@/components/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Sale Entry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the customer and items to generate an invoice.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <InvoiceForm mode="create" />
    </div>
  );
}
