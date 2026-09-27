"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StockEntryInput = {
  productId: string | null;
  productName: string;
  sku: string;
  qty: number;
  rate: number;
};

export type ProductFormInput = {
  name: string;
  sku: string;
  stockQty: number;
  rate: number;
};

/** Adds stock for an existing product (by id) or creates a new one, logging a stock_entries row. */
export async function addStockEntry(input: StockEntryInput): Promise<{ id: string }> {
  const name = input.productName.trim();
  if (!name) {
    throw new Error("Product name is required.");
  }
  if (input.qty <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  const supabase = await createClient();

  let productId = input.productId;

  if (productId) {
    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("stock_qty")
      .eq("id", productId)
      .single();
    if (fetchError || !existing) {
      throw new Error("Selected product no longer exists.");
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_qty: Number(existing.stock_qty) + input.qty, rate: input.rate })
      .eq("id", productId);
    if (updateError) throw new Error(updateError.message);
  } else {
    // No product selected — match by name (case-insensitive) to avoid duplicates.
    const { data: match } = await supabase
      .from("products")
      .select("id, stock_qty")
      .ilike("name", name)
      .maybeSingle();

    if (match) {
      productId = match.id;
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock_qty: Number(match.stock_qty) + input.qty, rate: input.rate })
        .eq("id", match.id);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { data: created, error: createError } = await supabase
        .from("products")
        .insert({ name, sku: input.sku || null, stock_qty: input.qty, rate: input.rate })
        .select("id")
        .single();
      if (createError || !created) {
        throw new Error(createError?.message ?? "Failed to create product.");
      }
      productId = created.id;
    }
  }

  if (!productId) {
    throw new Error("Failed to resolve product.");
  }

  const { error: entryError } = await supabase.from("stock_entries").insert({
    product_id: productId,
    qty: input.qty,
    rate: input.rate,
  });
  if (entryError) throw new Error(entryError.message);

  revalidatePath("/products");
  return { id: productId };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<{ id: string }> {
  if (!input.name.trim()) {
    throw new Error("Product name is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      sku: input.sku.trim() || null,
      stock_qty: input.stockQty,
      rate: input.rate,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/products");
  return { id };
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, stock_qty, rate")
    .ilike("name", `%${query.trim()}%`)
    .order("name", { ascending: true })
    .limit(6);

  if (error) return [];
  return data;
}
