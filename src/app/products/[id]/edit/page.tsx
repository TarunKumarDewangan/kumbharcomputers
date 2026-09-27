import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/ProductForm";
import type { Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error || !data) {
    notFound();
  }

  const product = data as Product;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Product</h1>
          <p className="mt-1 text-sm text-slate-500">{product.name}</p>
        </div>
        <Link
          href="/products"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
      </div>
      <ProductForm
        productId={id}
        initialValues={{
          name: product.name,
          sku: product.sku ?? "",
          stockQty: product.stock_qty,
          rate: product.rate,
        }}
      />
    </div>
  );
}
