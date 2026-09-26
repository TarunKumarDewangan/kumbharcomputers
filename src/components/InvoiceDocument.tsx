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

const td = "border border-black align-top p-3";
// Bold black section labels (INVOICE NO, DATE, TO (BILL TO), ...).
const metaLabel = "block text-[10px] font-semibold uppercase tracking-wide text-black";
// Plain company detail lines — must stay normal case, solid black (not gray).
const detail = "text-xs text-black leading-snug";

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <div className="mx-auto w-full max-w-[800px] border border-black bg-white text-black font-serif text-sm print:max-w-none">
      <div className="border-b border-black py-3 text-center">
        <h1 className="text-2xl font-bold tracking-wide underline underline-offset-4">
          INVOICE
        </h1>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          {/* Company block + invoice meta */}
          <tr>
            <td className={`${td} border-l-0`} style={{ width: "60%" }}>
              <p className="text-lg font-bold leading-tight">{COMPANY.name}</p>
              <p className="text-lg font-bold leading-tight">{COMPANY.city}</p>
              <p className={`${detail} mt-2`}>GST NO.: {COMPANY.gstNo}</p>
              <p className={detail}>{COMPANY.stateCode}</p>
              <p className={detail}>E-mail: {COMPANY.email}</p>
              <p className={detail}>Mobile No: {COMPANY.mobiles}</p>
            </td>
            <td className={`${td} border-r-0 border-t-0 p-0`} style={{ width: "40%" }}>
              <div className="border-b border-black p-3">
                <span className={metaLabel}>Invoice No</span>
                <p className="font-bold">{invoice.invoice_no}</p>
              </div>
              <div className="border-b border-black p-3">
                <span className={metaLabel}>Date</span>
                <p className="font-bold">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div className="border-b border-black p-3">
                <span className={metaLabel}>Order No.</span>
                {invoice.order_no && <p>{invoice.order_no}</p>}
              </div>
              <div className="p-3">
                <span className={metaLabel}>Terms of Payment</span>
                {invoice.terms_of_payment && <p>{invoice.terms_of_payment}</p>}
              </div>
            </td>
          </tr>

          {/* Bill to */}
          <tr>
            <td className={`${td} border-x-0`} colSpan={2}>
              <span className={metaLabel}>To (Bill To)</span>
              <p className="mt-1 font-bold">{invoice.customer_name}</p>
              {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
              {invoice.customer_address && <p>{invoice.customer_address}</p>}
            </td>
          </tr>

          {/* Items table header */}
          <tr>
            <td className={`${td} border-l-0 text-center font-semibold`} style={{ width: "6%" }}>
              S.N
            </td>
            <td className={`${td} text-center font-semibold`}>Description</td>
            <td className={`${td} text-center font-semibold`} style={{ width: "9%" }}>
              QTY
            </td>
            <td className={`${td} text-center font-semibold`} style={{ width: "22%" }}>
              Rate
              <br />
              <span className="whitespace-nowrap text-xs font-normal">(GST 18% Incl.)</span>
            </td>
            <td className={`${td} border-r-0 text-center font-semibold`} style={{ width: "16%" }}>
              Amount
            </td>
          </tr>

          {invoice.invoice_items.map((item) => (
            <tr key={item.id}>
              <td className={`${td} border-l-0 text-center`}>{item.sno}</td>
              <td className={td}>
                {item.description}
                {item.item_serial && (
                  <>
                    <br />
                    <span className="text-xs">(S.NO- {item.item_serial})</span>
                  </>
                )}
              </td>
              <td className={`${td} text-center`}>{item.qty}</td>
              <td className={`${td} text-right`}>{formatMoney(item.rate)}</td>
              <td className={`${td} border-r-0 text-right`}>{formatMoney(item.amount)}</td>
            </tr>
          ))}

          {/* Totals */}
          <tr>
            <td className={`${td} border-x-0 border-t-2`} style={{ width: "60%" }}>
              <span className={metaLabel}>Amount in words</span>
              <p className="mt-1 font-bold uppercase">{invoice.amount_in_words}</p>
            </td>
            <td className={`${td} border-r-0 border-t-2 text-right`} style={{ width: "40%" }}>
              <span className={metaLabel}>Grand Total:</span>
              <p className="text-2xl font-bold">{formatMoney(invoice.total_amount)}</p>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td className={`${td} border-x-0 border-b-0`} colSpan={2}>
              <div className="flex justify-between gap-6">
                <p className="text-xs leading-relaxed">
                  We declare that this invoice shows the actual price of the goods
                  described and that all particulars are true and correct.
                  <br />
                  <span className="font-bold">Bank of Baroda A/c. No.: {COMPANY.accountNo}</span>
                  <br />
                  <span className="font-bold">IFSC Code: {COMPANY.ifsc}</span>
                  <br />
                  <span className="font-bold">PAN NO.: {COMPANY.panNo}</span>
                </p>
                <div className="shrink-0 text-center text-xs">
                  <p>
                    For <span className="font-bold">{COMPANY.name}</span>
                  </p>
                  <p className="mt-10 border-t border-dotted border-black pt-1">
                    Authorised Signatory
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
