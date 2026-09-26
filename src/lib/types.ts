export type InvoiceItem = {
  id: string;
  sno: number;
  description: string;
  item_serial: string | null;
  qty: number;
  rate: number;
  amount: number;
};

export type Invoice = {
  id: string;
  invoice_no: number;
  invoice_date: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_no: string | null;
  terms_of_payment: string | null;
  amount_in_words: string;
  total_amount: number;
  created_at: string;
  invoice_items: InvoiceItem[];
};
