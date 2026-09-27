import Link from "next/link";
import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Customer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Saved customers show up as suggestions on the sales form.
          </p>
        </div>
        <Link
          href="/customers"
          prefetch={false}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <CustomerForm mode="create" />
    </div>
  );
}
