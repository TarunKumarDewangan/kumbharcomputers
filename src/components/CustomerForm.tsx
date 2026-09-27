"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer, type CustomerFormInput } from "@/app/customers/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

export function CustomerForm({
  mode,
  customerId,
  initialValues,
}: {
  mode: "create" | "edit";
  customerId?: string;
  initialValues?: CustomerFormInput;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "edit" && customerId) {
          await updateCustomer(customerId, { name, phone, address });
        } else {
          await createCustomer({ name, phone, address });
        }
        router.push("/customers");
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
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Customer Name *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tarun Kumar Dewangan"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="7898108422"
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Dhamtari"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Customer"}
      </button>
    </form>
  );
}
