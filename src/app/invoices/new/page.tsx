import Link from "next/link";
import { NewInvoiceForm } from "./NewInvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">New Sale Entry</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back
        </Link>
      </div>
      <NewInvoiceForm />
    </div>
  );
}
