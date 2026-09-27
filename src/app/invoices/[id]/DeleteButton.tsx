"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "@/app/invoices/actions";

export function DeleteButton({ invoiceId, invoiceNo }: { invoiceId: string; invoiceNo: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete invoice #${invoiceNo}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteInvoice(invoiceId);
      router.push("/");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
