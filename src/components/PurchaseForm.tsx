"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPurchase,
  updatePurchase,
  searchPurchaseProducts,
  type NewPurchaseItemInput,
  type PurchaseFormInput,
} from "@/app/purchases/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";
const cardClass = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

function emptyItem(): NewPurchaseItemInput {
  return { product_name: "", quantity: 1, unit_price: 0 };
}

export type PurchaseFormValues = {
  purchaseDate: string;
  notes: string;
  items: NewPurchaseItemInput[];
};

export function PurchaseForm({
  mode,
  purchaseId,
  initialValues,
}: {
  mode: "create" | "edit";
  purchaseId?: string;
  initialValues?: PurchaseFormValues;
}) {
  const [purchaseDate, setPurchaseDate] = useState(
    () => initialValues?.purchaseDate ?? new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [items, setItems] = useState<NewPurchaseItemInput[]>(initialValues?.items ?? [emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  function updateItem(index: number, patch: Partial<NewPurchaseItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!items.some((i) => i.product_name.trim())) {
      setError("Add at least one item with a product name.");
      return;
    }

    const payload: PurchaseFormInput = { purchaseDate, notes, items };

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
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-800">Order Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Purchase Date *</label>
            <input
              type="date"
              className={inputClass}
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Notes (supplier, order no., etc.)</label>
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ordered from XYZ Distributors, Raipur"
            />
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            + Add Item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <PurchaseItemRow
              key={index}
              item={item}
              onChange={(patch) => updateItem(index, patch)}
              onRemove={items.length > 1 ? () => removeItem(index) : undefined}
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
            <p className="truncate text-base font-bold text-slate-900 sm:text-lg">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
          >
            {isPending ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Purchase"}
          </button>
        </div>
      </div>
    </form>
  );
}

function PurchaseItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: NewPurchaseItemInput;
  onChange: (patch: Partial<NewPurchaseItemInput>) => void;
  onRemove?: () => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!item.product_name.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPurchaseProducts(item.product_name);
      setSuggestions(results);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.product_name]);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-12 sm:items-end">
      <div className="relative sm:col-span-5">
        <label className={labelClass}>Product Name *</label>
        <input
          className={inputClass}
          value={item.product_name}
          onChange={(e) => {
            onChange({ product_name: e.target.value });
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="e.g. HP 585 SMART TANK COLOR PRINTER"
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange({ product_name: name });
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
        <label className={labelClass}>Quantity *</label>
        <input
          type="number"
          min={0}
          step="1"
          className={inputClass}
          value={item.quantity}
          onChange={(e) => onChange({ quantity: Number(e.target.value) })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Price (per unit) *</label>
        <input
          type="number"
          min={0}
          step="0.01"
          className={inputClass}
          value={item.unit_price}
          onChange={(e) => onChange({ unit_price: Number(e.target.value) })}
        />
      </div>
      <div className="flex items-center justify-between sm:col-span-3 sm:flex-col sm:items-end sm:gap-1">
        <span className="text-xs font-semibold text-slate-700">
          ₹{(item.quantity * item.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
