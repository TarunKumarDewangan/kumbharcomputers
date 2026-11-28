import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "@/components/PurchaseForm";
import type { PurchaseOrder } from "@/lib/types";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const purchase = data as PurchaseOrder;
  const items = [...purchase.purchase_items].sort((a, b) => a.sno - b.sno);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Purchase</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(purchase.purchase_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/purchases"
          prefetch={false}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <PurchaseForm
        mode="edit"
        purchaseId={id}
        initialValues={{
          purchaseDate: purchase.purchase_date,
          notes: purchase.notes ?? "",
          items: items.map((i) => ({
            product_name: i.product_name,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        }}
      />
    </div>
  );
}
