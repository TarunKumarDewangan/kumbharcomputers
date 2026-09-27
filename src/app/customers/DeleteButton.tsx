"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/customers/actions";

export function DeleteButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete customer "${customerName}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteCustomer(customerId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
