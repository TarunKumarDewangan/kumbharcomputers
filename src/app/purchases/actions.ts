"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NewPurchaseItemInput = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type PurchaseFormInput = {
  purchaseDate: string;
  notes: string;
  items: NewPurchaseItemInput[];
  gstApplicable: boolean;
  gstPercent: number | null;
  paidAmount: number;
};

function buildOrderRow(input: PurchaseFormInput, totalPrice: number) {
  const gstApplicable = input.gstApplicable && Boolean(input.gstPercent);
  const gstPercent = gstApplicable ? input.gstPercent : null;
  const taxableAmount = gstApplicable && gstPercent ? input.paidAmount / (1 + gstPercent / 100) : null;
  const gstAmount = taxableAmount !== null ? input.paidAmount - taxableAmount : null;

  return {
    purchase_date: input.purchaseDate || new Date().toISOString().slice(0, 10),
    notes: input.notes.trim() || null,
    total_price: totalPrice,
    gst_applicable: gstApplicable,
    gst_percent: gstPercent,
    paid_amount: input.paidAmount,
    taxable_amount: taxableAmount,
    gst_amount: gstAmount,
  };
}

function buildItemRows(orderId: string, items: NewPurchaseItemInput[]) {
  return items
    .filter((item) => item.product_name.trim())
    .map((item, index) => ({
      purchase_order_id: orderId,
      sno: index + 1,
      product_name: item.product_name.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));
}

export async function createPurchase(input: PurchaseFormInput): Promise<{ id: string }> {
  const validItems = input.items.filter((item) => item.product_name.trim());
  if (validItems.length === 0) {
    throw new Error("Add at least one item with a product name.");
  }

  const totalPrice = validItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .insert(buildOrderRow(input, totalPrice))
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to save purchase.");
  }

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(buildItemRows(order.id, validItems));

  if (itemsError) {
    await supabase.from("purchase_orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  revalidatePath("/purchases");
  return { id: order.id };
}

export async function updatePurchase(id: string, input: PurchaseFormInput): Promise<{ id: string }> {
  const validItems = input.items.filter((item) => item.product_name.trim());
  if (validItems.length === 0) {
    throw new Error("Add at least one item with a product name.");
  }

  const totalPrice = validItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const supabase = await createClient();

  const { error: orderError } = await supabase
    .from("purchase_orders")
    .update(buildOrderRow(input, totalPrice))
    .eq("id", id);

  if (orderError) {
    throw new Error(orderError.message);
  }

  const { error: deleteError } = await supabase.from("purchase_items").delete().eq("purchase_order_id", id);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: itemsError } = await supabase.from("purchase_items").insert(buildItemRows(id, validItems));
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  revalidatePath("/purchases");
  return { id };
}

export async function deletePurchase(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/purchases");
}

export async function searchPurchaseProducts(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_items")
    .select("product_name")
    .ilike("product_name", `%${query.trim()}%`)
    .limit(20);

  if (error || !data) return [];
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
