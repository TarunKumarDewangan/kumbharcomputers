"use server";

import { createClient } from "@/lib/supabase/server";
import { amountToWordsIndian } from "@/lib/numberToWords";

export type NewItemInput = {
  description: string;
  item_serial: string;
  qty: number;
  rate: number;
};

export type CreateInvoiceInput = {
  invoice_date: string;
  customer_name: string;
  customer_phone: string;
  order_no: string;
  order_date: string;
  despatch_document_no: string;
  despatch_date: string;
  despatch_through: string;
  destination: string;
  supplier_ref: string;
  other_reference: string;
  terms_of_payment: string;
  items: NewItemInput[];
};

export async function createInvoice(input: CreateInvoiceInput): Promise<{ id: string }> {
  const supabase = await createClient();

  const items = input.items.filter((i) => i.description.trim().length > 0);
  if (items.length === 0) {
    throw new Error("Add at least one item.");
  }

  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.rate, 0);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_date: input.invoice_date || new Date().toISOString().slice(0, 10),
      customer_name: input.customer_name,
      customer_phone: input.customer_phone || null,
      order_no: input.order_no || null,
      order_date: input.order_date || null,
      despatch_document_no: input.despatch_document_no || null,
      despatch_date: input.despatch_date || null,
      despatch_through: input.despatch_through || null,
      destination: input.destination || null,
      supplier_ref: input.supplier_ref || null,
      other_reference: input.other_reference || null,
      terms_of_payment: input.terms_of_payment || null,
      amount_in_words: amountToWordsIndian(totalAmount),
      total_amount: totalAmount,
    })
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

  return { id: invoice.id };
}
