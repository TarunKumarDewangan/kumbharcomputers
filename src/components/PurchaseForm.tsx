"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPurchase,
  updatePurchase,
  searchPurchaseProducts,
  type PurchaseFormInput,
} from "@/app/purchases/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

export function PurchaseForm({
  mode,
  purchaseId,
  initialValues,
}: {
  mode: "create" | "edit";
  purchaseId?: string;
  initialValues?: PurchaseFormInput;
}) {
  const [purchaseDate, setPurchaseDate] = useState(
    () => initialValues?.purchaseDate ?? new Date().toISOString().slice(0, 10)
  );
  const [productName, setProductName] = useState(initialValues?.productName ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? 1);
  const [totalPrice, setTotalPrice] = useState(initialValues?.totalPrice ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!productName.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPurchaseProducts(productName);
      setSuggestions(results);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [productName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const payload: PurchaseFormInput = {
      purchaseDate,
      productName,
      description,
      quantity,
      totalPrice,
    };

    startTransition(async () => {
      try {
        if (mode === "edit" && purchaseId) {
          await updatePurchase(purchaseId, payload);
        } else {
          await createPurchase(payload);
        }
        router.push("/purchases");
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
          <div>
            <label className={labelClass}>Purchase Date *</label>
            <input
              type="date"
              className={inputClass}
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div className="relative">
            <label className={labelClass}>Product Name *</label>
            <input
              className={inputClass}
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
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
                {suggestions.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setProductName(name);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-indigo-50"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>What was ordered (notes)</label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Ordered from XYZ Distributors, Raipur"
            />
          </div>
          <div>
            <label className={labelClass}>Quantity *</label>
            <input
              type="number"
              min={0}
              step="1"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Total Price *</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={totalPrice}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Purchase"}
      </button>
    </form>
  );
}
