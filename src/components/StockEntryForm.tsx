"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStockEntry, searchProducts } from "@/app/products/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

type ProductSuggestion = {
  id: string;
  name: string;
  sku: string | null;
  stock_qty: number;
  rate: number;
};

export function StockEntryForm() {
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (productId) return; // a suggestion was already picked; don't re-search until name changes again
    if (!productName.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchProducts(productName);
      setSuggestions(results);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName, productId]);

  function pickSuggestion(p: ProductSuggestion) {
    setProductId(p.id);
    setProductName(p.name);
    setSku(p.sku ?? "");
    setRate(Number(p.rate));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (qty <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    startTransition(async () => {
      try {
        await addStockEntry({ productId, productName, sku, qty, rate });
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
          <div className="relative sm:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input
              className={inputClass}
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setProductId(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. HP 585 SMART TANK COLOR PRINTER"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={() => pickSuggestion(p)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-indigo-50"
                    >
                      <span className="truncate font-medium text-slate-800">{p.name}</span>
                      <span className="shrink-0 text-xs text-slate-500">Stock: {p.stock_qty}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {productId && (
              <p className="mt-1 text-xs text-indigo-600">
                Adding stock to an existing product — quantity will be added to current stock.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>SKU / Serial (optional)</label>
            <input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div />

          <div>
            <label className={labelClass}>Quantity to Add *</label>
            <input
              type="number"
              min={0}
              step="1"
              className={inputClass}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
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
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Stock Entry"}
      </button>
    </form>
  );
}
