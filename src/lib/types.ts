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

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock_qty: number;
  rate: number;
  created_at: string;
};

export type StockEntry = {
  id: string;
  product_id: string;
  qty: number;
  rate: number | null;
  entry_date: string;
  created_at: string;
};
