import Link from "next/link";
import { PurchaseForm } from "@/components/PurchaseForm";

export default function NewPurchasePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Purchase</h1>
          <p className="mt-1 text-sm text-slate-500">Record what you bought, from whom, and for how much.</p>
        </div>
        <Link
          href="/purchases"
          prefetch={false}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <PurchaseForm mode="create" />
    </div>
  );
}
