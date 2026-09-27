"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CustomerFormInput = {
  name: string;
  phone: string;
  address: string;
};

export async function createCustomer(input: CustomerFormInput): Promise<{ id: string }> {
  if (!input.name.trim()) {
    throw new Error("Customer name is required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create customer.");
  }

  revalidatePath("/customers");
  return { id: data.id };
}

export async function updateCustomer(id: string, input: CustomerFormInput): Promise<{ id: string }> {
  if (!input.name.trim()) {
    throw new Error("Customer name is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  return { id };
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/customers");
}

export async function searchCustomers(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, address")
    .ilike("name", `%${query.trim()}%`)
    .order("name", { ascending: true })
    .limit(6);

  if (error) return [];
  return data;
}
