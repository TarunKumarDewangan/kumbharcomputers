"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, type ProductFormInput } from "@/app/products/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

export function ProductForm({
  productId,
  initialValues,
}: {
  productId: string;
  initialValues: ProductFormInput;
}) {
  const [name, setName] = useState(initialValues.name);
  const [sku, setSku] = useState(initialValues.sku);
  const [stockQty, setStockQty] = useState(initialValues.stockQty);
  const [rate, setRate] = useState(initialValues.rate);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    startTransition(async () => {
      try {
        await updateProduct(productId, { name, sku, stockQty, rate });
        router.push("/products");
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>SKU / Serial</label>
            <input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Rate (per unit)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input
              type="number"
              min={0}
              step="1"
              className={inputClass}
              value={stockQty}
              onChange={(e) => setStockQty(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-slate-400">
              Prefer &quot;New Stock Entry&quot; to add quantity — use this only to correct mistakes.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
