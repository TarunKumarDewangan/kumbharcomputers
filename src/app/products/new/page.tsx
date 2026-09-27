import Link from "next/link";
import { StockEntryForm } from "@/components/StockEntryForm";

export default function NewStockEntryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Stock Entry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search an existing product or type a new one — quantity is added to stock on hand.
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <StockEntryForm />
    </div>
  );
}
