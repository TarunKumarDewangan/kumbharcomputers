"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { amountToWordsIndian } from "@/lib/numberToWords";
import { upsertCustomerFromSale } from "@/app/customers/actions";

export type NewItemInput = {
  description: string;
  item_serial: string;
  qty: number;
  rate: number;
};

export type InvoiceFormInput = {
  invoice_date: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_no: string;
  terms_of_payment: string;
  items: NewItemInput[];
};

function buildInvoiceRow(input: InvoiceFormInput, items: NewItemInput[]) {
  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  return {
    row: {
      invoice_date: input.invoice_date || new Date().toISOString().slice(0, 10),
      customer_name: input.customer_name,
      customer_phone: input.customer_phone || null,
      customer_address: input.customer_address || null,
      order_no: input.order_no || null,
      terms_of_payment: input.terms_of_payment || null,
      amount_in_words: amountToWordsIndian(totalAmount),
      total_amount: totalAmount,
    },
    totalAmount,
  };
}

export async function createInvoice(input: InvoiceFormInput): Promise<{ id: string }> {
  const supabase = await createClient();

  const items = input.items.filter((i) => i.description.trim().length > 0);
  if (items.length === 0) {
    throw new Error("Add at least one item.");
  }

  const { row } = buildInvoiceRow(input, items);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert(row)
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message ?? "Failed to create invoice.");
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    items.map((item, index) => ({
      invoice_id: invoice.id,
      sno: index + 1,
      description: item.description,
      item_serial: item.item_serial || null,
      qty: item.qty,
      rate: item.rate,
    }))
  );

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  await upsertCustomerFromSale(input.customer_name, input.customer_phone, input.customer_address);

  revalidatePath("/");
  return { id: invoice.id };
}

export async function updateInvoice(id: string, input: InvoiceFormInput): Promise<{ id: string }> {
  const supabase = await createClient();

  const items = input.items.filter((i) => i.description.trim().length > 0);
  if (items.length === 0) {
    throw new Error("Add at least one item.");
  }

  const { row } = buildInvoiceRow(input, items);

  const { error: invoiceError } = await supabase.from("invoices").update(row).eq("id", id);
  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  // Replace the item set wholesale — simplest way to keep sno/order consistent.
  const { error: deleteError } = await supabase.from("invoice_items").delete().eq("invoice_id", id);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    items.map((item, index) => ({
      invoice_id: id,
      sno: index + 1,
      description: item.description,
      item_serial: item.item_serial || null,
      qty: item.qty,
      rate: item.rate,
    }))
  );
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  await upsertCustomerFromSale(input.customer_name, input.customer_phone, input.customer_address);

  revalidatePath("/");
  revalidatePath(`/invoices/${id}`);
  return { id };
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
