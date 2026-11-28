"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePurchase } from "@/app/purchases/actions";

export function DeleteButton({ purchaseId, label }: { purchaseId: string; label: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete this purchase (${label})? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deletePurchase(purchaseId);
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
