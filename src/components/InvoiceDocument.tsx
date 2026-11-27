import { COMPANY } from "@/lib/company";
import type { Invoice } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Fixed sections (header, seller/invoice box, bill-to, totals, declaration) take up a
// known chunk of the half-page (148.5mm x 210mm landscape-half) print area. Whatever's
// left is the budget for the items table, so when there are more rows than the
// "designed for" count, shrink row height/font to keep the whole invoice on one half
// page instead of spilling onto a second page.
const ITEMS_AREA_MM = 62;
const TABLE_HEADER_MM = 9;
const DESIGNED_ROW_MM = 11;
const MIN_ROW_MM = 5;
const MIN_FONT_PX = 7.5;
const BASE_FONT_PX = 10;

function getTableSizing(itemCount: number) {
  if (itemCount <= 0) {
    return { rowMm: DESIGNED_ROW_MM, headerMm: TABLE_HEADER_MM, fontPx: BASE_FONT_PX };
  }
  const available = ITEMS_AREA_MM - TABLE_HEADER_MM;
  const fitRowMm = available / itemCount;
  const rowMm = Math.max(MIN_ROW_MM, Math.min(DESIGNED_ROW_MM, fitRowMm));
  const scale = rowMm / DESIGNED_ROW_MM;
  const fontPx = Math.max(MIN_FONT_PX, Math.round(BASE_FONT_PX * scale));
  const headerMm = rowMm < DESIGNED_ROW_MM ? Math.max(10, TABLE_HEADER_MM * scale) : TABLE_HEADER_MM;
  return { rowMm, headerMm, fontPx };
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const { rowMm, headerMm, fontPx } = getTableSizing(invoice.invoice_items.length);

  return (
    <div
      id="invoice"
      className="mx-auto min-h-[210mm] w-[148.5mm] bg-white p-[5mm] text-black shadow-xl print:min-h-0 print:w-full print:p-[5mm] print:shadow-none font-[family-name:var(--font-geist-sans)] antialiased"
    >
      {/* Header */}
      <div className="mb-2 text-center">
        <h1 className="inline-block border-b-2 border-black px-1 pb-0.5 text-[15px] font-bold tracking-[1.5px]">
          INVOICE
        </h1>
      </div>

      {/* Seller and Invoice Details */}
      <div className="grid grid-cols-[58%_42%] border-2 border-black">
        <div className="border-r-2 border-black p-2">
          <h2 className="text-[13px] font-bold leading-4">{COMPANY.name}</h2>
          <p className="text-[10px] font-semibold text-gray-700">{COMPANY.city}</p>

          <div className="mt-1 space-y-0.5 text-[8px] leading-[1.4] text-gray-700">
            <p>GST NO.: {COMPANY.gstNo}</p>
            <p>{COMPANY.stateCode}</p>
            <p>E-mail: {COMPANY.email}</p>
            <p>Mobile No: {COMPANY.mobiles}</p>
          </div>
        </div>

        <div className="text-[8.5px]">
          <div className="min-h-[7mm] border-b border-black p-1">
            <p className="text-[7px] text-gray-600">INVOICE NO</p>
            <p className="mt-0.5 font-semibold">{invoice.invoice_no}</p>
          </div>

          <div className="min-h-[7mm] border-b border-black p-1">
            <p className="text-[7px] text-gray-600">DATE</p>
            <p className="mt-0.5 font-semibold">{formatDate(invoice.invoice_date)}</p>
          </div>

          <div className="min-h-[7mm] border-b border-black p-1">
            <p className="text-[7px] text-gray-600">Order No.</p>
            {invoice.order_no && <p className="mt-0.5 font-semibold">{invoice.order_no}</p>}
          </div>

          <div className="flex min-h-[7mm] flex-col justify-center p-1">
            <p className="text-[7px] text-gray-600">Terms of Payment</p>
            {invoice.terms_of_payment && (
              <p className="mt-0.5 font-semibold">{invoice.terms_of_payment}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mt-1.5 border-2 border-black p-1.5">
        <p className="mb-0.5 text-[8px] text-gray-600">TO (Bill To)</p>

        <div className="space-y-0.5 text-[9px] leading-[1.35]">
          <p className="font-semibold">{invoice.customer_name}</p>
          {invoice.customer_phone && <p className="text-gray-800">{invoice.customer_phone}</p>}
          {invoice.customer_address && <p className="font-semibold">{invoice.customer_address}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-1.5">
        <table
          className="w-full table-fixed border-collapse"
          style={{ fontSize: `${fontPx}px` }}
        >
          <thead>
            <tr style={{ height: `${headerMm}mm` }}>
              <th className="w-[5.5%] border border-black px-1">S.N</th>
              <th className="w-[49%] border border-black px-1.5">Description</th>
              <th className="w-[15%] border border-black px-1">QTY</th>
              <th className="w-[20%] border border-black px-1">
                <div>Rate</div>
                <div className="mt-0.5 text-[0.8em] font-normal">(GST 18% Incl.)</div>
              </th>
              <th className="w-[10.5%] border border-black px-1">Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id} style={{ height: `${rowMm}mm` }}>
                <td className="border border-black text-center">{item.sno}</td>
                <td className="border border-black px-1.5">
                  {item.description}
                  {item.item_serial && (
                    <span className="block text-[0.85em] text-gray-600">
                      (S.NO- {item.item_serial})
                    </span>
                  )}
                </td>
                <td className="border border-black text-center">{item.qty}</td>
                <td className="border border-black px-1 text-right">{formatMoney(item.rate)}</td>
                <td className="border border-black px-1 text-right">{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Amount in Words and Total */}
      <div className="mt-1.5 grid grid-cols-[66%_34%] border-2 border-black">
        <div className="min-h-[13mm] border-r-2 border-black p-2">
          <p className="text-[8px] text-gray-600">Amount in words</p>
          <p className="mt-1 text-[9px] font-bold">{invoice.amount_in_words}</p>
        </div>

        <div className="flex items-center justify-between gap-1 p-2">
          <p className="text-[9px] font-bold leading-4">
            Grand
            <br />
            Total:
          </p>
          <p className="border-b-4 border-gray-400 px-1 pb-0.5 text-[18px] font-bold leading-none">
            {formatMoney(invoice.total_amount)}
          </p>
        </div>
      </div>

      {/* Declaration and Signature */}
      <div className="mt-1.5 grid grid-cols-[66%_34%] border-2 border-black">
        <div className="min-h-[24mm] border-r-2 border-black p-2">
          <p className="text-[8px] leading-[1.4]">
            We declare that this invoice shows the actual price of the goods described
            and that all particulars are true and correct.
          </p>

          <div className="mt-1.5 space-y-0.5 text-[7.5px]">
            <p>
              <strong>Bank of Baroda A/c. No:</strong> {COMPANY.accountNo}
            </p>
            <p>
              <strong>IFSC Code:</strong> {COMPANY.ifsc}
            </p>
            <p>
              <strong>PAN NO.:</strong> {COMPANY.panNo}
            </p>
          </div>
        </div>

        <div className="flex min-h-[24mm] flex-col justify-between p-2 text-center">
          <p className="text-[8px]">
            For <strong>{COMPANY.name}</strong>
          </p>
          <div className="mx-1 border-b border-dotted border-black" />
          <p className="text-[8px]">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}
