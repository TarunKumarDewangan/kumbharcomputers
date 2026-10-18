"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PurchaseFormInput = {
  purchaseDate: string;
  productName: string;
  description: string;
  quantity: number;
  totalPrice: number;
};

function buildRow(input: PurchaseFormInput) {
  return {
    purchase_date: input.purchaseDate || new Date().toISOString().slice(0, 10),
    product_name: input.productName.trim(),
    description: input.description.trim() || null,
    quantity: input.quantity,
    total_price: input.totalPrice,
  };
}

export async function createPurchase(input: PurchaseFormInput): Promise<{ id: string }> {
  if (!input.productName.trim()) {
    throw new Error("Product name is required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .insert(buildRow(input))
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save purchase.");
  }

  revalidatePath("/purchases");
  return { id: data.id };
}

export async function updatePurchase(id: string, input: PurchaseFormInput): Promise<{ id: string }> {
  if (!input.productName.trim()) {
    throw new Error("Product name is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchases").update(buildRow(input)).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/purchases");
  return { id };
}

export async function deletePurchase(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/purchases");
}

export async function searchPurchaseProducts(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("product_name")
    .ilike("product_name", `%${query.trim()}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  // De-duplicate product names (case-insensitive) for a clean suggestion list.
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of data) {
    const key = row.product_name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      names.push(row.product_name);
    }
  }
  return names.slice(0, 6);
}
