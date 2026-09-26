"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoice, type NewItemInput } from "@/app/invoices/actions";

function emptyItem(): NewItemInput {
  return { description: "", item_serial: "", qty: 1, rate: 0 };
}

const inputClass =
  "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-gray-600";

export function NewInvoiceForm() {
  const [items, setItems] = useState<NewItemInput[]>([emptyItem()]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [despatchDocumentNo, setDespatchDocumentNo] = useState("");
  const [despatchDate, setDespatchDate] = useState("");
  const [despatchThrough, setDespatchThrough] = useState("");
  const [destination, setDestination] = useState("");
  const [supplierRef, setSupplierRef] = useState("");
  const [otherReference, setOtherReference] = useState("");
  const [termsOfPayment, setTermsOfPayment] = useState("");
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

    startTransition(async () => {
      try {
        const { id } = await createInvoice({
          invoice_date: invoiceDate,
          customer_name: customerName,
          customer_phone: customerPhone,
          order_no: orderNo,
          order_date: orderDate,
          despatch_document_no: despatchDocumentNo,
          despatch_date: despatchDate,
          despatch_through: despatchThrough,
          destination,
          supplier_ref: supplierRef,
          other_reference: otherReference,
          terms_of_payment: termsOfPayment,
          items,
        });
        router.push(`/invoices/${id}`);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Customer & Invoice</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Customer Name *</label>
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Customer Phone</label>
            <input
              className={inputClass}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
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
        </div>
      </section>

      <details className="rounded border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">
          Order / Despatch details (optional)
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Order No.</label>
            <input className={inputClass} value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Order Date</label>
            <input type="date" className={inputClass} value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Despatch Document No.</label>
            <input className={inputClass} value={despatchDocumentNo} onChange={(e) => setDespatchDocumentNo(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Despatch Date</label>
            <input type="date" className={inputClass} value={despatchDate} onChange={(e) => setDespatchDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Despatched Through</label>
            <input className={inputClass} value={despatchThrough} onChange={(e) => setDespatchThrough(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Destination</label>
            <input className={inputClass} value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Supplier&apos;s Ref.</label>
            <input className={inputClass} value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Other Reference(s)</label>
            <input className={inputClass} value={otherReference} onChange={(e) => setOtherReference(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Terms of Payment</label>
            <input className={inputClass} value={termsOfPayment} onChange={(e) => setTermsOfPayment(e.target.value)} />
          </div>
        </div>
      </details>

      <section className="rounded border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 rounded border border-gray-100 p-3 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5">
                <label className={labelClass}>Description of Goods *</label>
                <input
                  className={inputClass}
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="e.g. HP 585 SMART TANK COLOR PRINTER"
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Serial No. (S.NO-)</label>
                <input
                  className={inputClass}
                  value={item.item_serial}
                  onChange={(e) => updateItem(index, { item_serial: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
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
              <div className="flex items-center justify-between sm:col-span-1">
                <span className="text-xs text-gray-500">
                  {(item.qty * item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-2 text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-end text-sm font-semibold">
          Total: ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save & Generate Invoice"}
      </button>
    </form>
  );
}
