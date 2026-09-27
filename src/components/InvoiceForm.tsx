"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInvoice,
  updateInvoice,
  type InvoiceFormInput,
  type NewItemInput,
} from "@/app/invoices/actions";

function emptyItem(): NewItemInput {
  return { description: "", item_serial: "", qty: 1, rate: 0 };
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";
const cardClass = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

export type InvoiceFormValues = {
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderNo: string;
  termsOfPayment: string;
  items: NewItemInput[];
};

export function InvoiceForm({
  mode,
  invoiceId,
  initialValues,
}: {
  mode: "create" | "edit";
  invoiceId?: string;
  initialValues?: InvoiceFormValues;
}) {
  const [items, setItems] = useState<NewItemInput[]>(initialValues?.items ?? [emptyItem()]);
  const [customerName, setCustomerName] = useState(initialValues?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialValues?.customerPhone ?? "");
  const [customerAddress, setCustomerAddress] = useState(initialValues?.customerAddress ?? "");
  const [invoiceDate, setInvoiceDate] = useState(
    () => initialValues?.invoiceDate ?? new Date().toISOString().slice(0, 10)
  );
  const [orderNo, setOrderNo] = useState(initialValues?.orderNo ?? "");
  const [termsOfPayment, setTermsOfPayment] = useState(initialValues?.termsOfPayment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const total = items.reduce((s, i) => s + i.qty * i.rate, 0);

  function updateItem(index: number, patch: Partial<NewItemInput>) {
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

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!items.some((i) => i.description.trim())) {
      setError("Add at least one item with a description.");
      return;
    }

    const payload: InvoiceFormInput = {
      invoice_date: invoiceDate,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      order_no: orderNo,
      terms_of_payment: termsOfPayment,
      items,
    };

    startTransition(async () => {
      try {
        const { id } =
          mode === "edit" && invoiceId
            ? await updateInvoice(invoiceId, payload)
            : await createInvoice(payload);
        router.push(`/invoices/${id}`);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
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
        <SectionHeading step="1" title="Customer & Invoice" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Customer Name *</label>
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Tarun Kumar Dewangan"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Customer Phone</label>
            <input
              className={inputClass}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="7898108422"
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              className={inputClass}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Customer Address</label>
            <input
              className={inputClass}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Dhamtari"
            />
          </div>
          <div>
            <label className={labelClass}>Order No.</label>
            <input className={inputClass} value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          </div>
        </div>
      </section>

      <details className={`${cardClass} group`} open={Boolean(initialValues?.termsOfPayment)}>
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800">
          <SectionHeading step="2" title="Terms of Payment" subtitle="optional" />
          <svg
            className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="mt-4">
          <input
            className={inputClass}
            value={termsOfPayment}
            onChange={(e) => setTermsOfPayment(e.target.value)}
            placeholder="e.g. Cash / UPI / 7 days credit"
          />
        </div>
      </details>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <SectionHeading step="3" title="Items" />
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
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-12 sm:items-end"
            >
              <div className="sm:col-span-4">
                <label className={labelClass}>Description of Goods *</label>
                <input
                  className={inputClass}
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="e.g. HP 585 SMART TANK COLOR PRINTER"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Serial No. (S.NO-)</label>
                <input
                  className={inputClass}
                  value={item.item_serial}
                  onChange={(e) => updateItem(index, { item_serial: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Qty</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={inputClass}
                  value={item.qty}
                  onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Rate (incl. GST)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={item.rate}
                  onChange={(e) => updateItem(index, { rate: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2 sm:flex-col sm:items-end sm:gap-1">
                <span className="text-xs font-semibold text-slate-700">
                  ₹{(item.qty * item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Amount</p>
            <p className="text-lg font-bold text-slate-900">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Save & Generate Invoice"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionHeading({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
        {step}
      </span>
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {subtitle && <span className="text-xs text-slate-400">({subtitle})</span>}
    </div>
  );
}
