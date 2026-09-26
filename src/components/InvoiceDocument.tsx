import { COMPANY } from "@/lib/company";
import type { Invoice } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const td = "border border-black align-top p-1";
const label = "text-[10px] leading-tight text-black";

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const totalQty = invoice.invoice_items.reduce((s, i) => s + i.qty, 0);

  // Pad the item table with blank rows so short invoices still fill a full page nicely.
  const blankRowsNeeded = Math.max(0, 8 - invoice.invoice_items.length);

  return (
    <div className="mx-auto w-full max-w-[800px] bg-white text-black font-serif text-sm print:max-w-none">
      <h1 className="mb-2 text-center text-2xl font-bold tracking-wide">INVOICE</h1>

      <table className="w-full border-collapse border border-black">
        <tbody>
          {/* Company block + invoice meta */}
          <tr>
            <td className={td} rowSpan={2} style={{ width: "55%" }}>
              <p className="text-lg font-bold leading-tight">{COMPANY.name}</p>
              <p className="text-lg font-bold leading-tight">{COMPANY.city}</p>
              <p className={label}>GST NO.:{COMPANY.gstNo}</p>
              <p className={label}>{COMPANY.stateCode}</p>
              <p className={label}>E-mail:{COMPANY.email}</p>
              <p className={label}>Mobile No:{COMPANY.mobiles}</p>
            </td>
            <td className={td} style={{ width: "27%" }}>
              <span className={label}>INVOICE NO {invoice.invoice_no}</span>
            </td>
            <td className={td} style={{ width: "18%" }}>
              <span className={label}>{formatDate(invoice.invoice_date)}</span>
            </td>
          </tr>
          <tr>
            <td className={td} colSpan={2}>
              <span className={label}>Terms of Payment</span>
              {invoice.terms_of_payment && (
                <p className="mt-1">{invoice.terms_of_payment}</p>
              )}
            </td>
          </tr>
          <tr>
            <td className={td} rowSpan={2}>
              <span className={label}>TO</span>
              <p className="mt-1 font-semibold">{invoice.customer_name}</p>
              {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
            </td>
            <td className={td}>
              <span className={label}>Supplier&apos;s Ref.</span>
              {invoice.supplier_ref && <p className="mt-1">{invoice.supplier_ref}</p>}
            </td>
            <td className={td}>
              <span className={label}>Other Reference(s)</span>
              {invoice.other_reference && <p className="mt-1">{invoice.other_reference}</p>}
            </td>
          </tr>
          <tr>
            <td className={td} colSpan={2}>
              <div className="flex justify-between">
                <span className={label}>Order No.</span>
                <span className={label}>{invoice.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className={label}>Date</span>
                <span className={label}>{formatDate(invoice.order_date)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className={td} colSpan={3}>
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <span className={label}>Despatch Document No.</span>
                  <p>{invoice.despatch_document_no}</p>
                </div>
                <div>
                  <span className={label}>Date</span>
                  <p>{formatDate(invoice.despatch_date)}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className={td} colSpan={3}>
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <span className={label}>Despatched through</span>
                  <p>{invoice.despatch_through}</p>
                </div>
                <div>
                  <span className={label}>Destination</span>
                  <p>{invoice.destination}</p>
                </div>
              </div>
            </td>
          </tr>

          {/* Items table header */}
          <tr>
            <td className={`${td} text-center font-semibold`} style={{ width: "6%" }}>
              S.N
            </td>
            <td className={`${td} text-center font-semibold`}>Description of Goods</td>
            <td className={`${td} text-center font-semibold`} style={{ width: "8%" }}>
              QTY
            </td>
            <td className={`${td} text-center font-semibold`} style={{ width: "16%" }}>
              Rate
              <br />
              (GST 18%)
              <br />
              (incl. of tax)
            </td>
            <td className={`${td} text-center font-semibold`} style={{ width: "16%" }}>
              Amount
            </td>
          </tr>

          {invoice.invoice_items.map((item) => (
            <tr key={item.id}>
              <td className={`${td} text-center`}>{item.sno}</td>
              <td className={td}>
                {item.description}
                {item.item_serial && (
                  <>
                    <br />
                    (S.NO- {item.item_serial})
                  </>
                )}
              </td>
              <td className={`${td} text-center`}>{item.qty}</td>
              <td className={`${td} text-right`}>{formatMoney(item.rate)}</td>
              <td className={`${td} text-right`}>{formatMoney(item.amount)}</td>
            </tr>
          ))}

          {Array.from({ length: blankRowsNeeded }).map((_, i) => (
            <tr key={`blank-${i}`}>
              <td className={`${td} h-6`}></td>
              <td className={td}></td>
              <td className={td}></td>
              <td className={td}></td>
              <td className={td}></td>
            </tr>
          ))}

          <tr>
            <td className={`${td} font-semibold`} colSpan={3}>
              Amount Chargeable (in words)
            </td>
            <td className={`${td} text-center`}>{totalQty}</td>
            <td className={`${td} text-right font-semibold`}>{formatMoney(invoice.total_amount)}</td>
          </tr>
          <tr>
            <td className={`${td} font-bold uppercase`} colSpan={5}>
              {invoice.amount_in_words}
            </td>
          </tr>
          <tr>
            <td className={`${td}`} colSpan={5}>
              <div className="flex justify-between gap-4">
                <p className="text-xs">
                  We declare that this invoice shows the actual price of the goods
                  described and that all particulars are true and correct.
                  <br />
                  <span className="font-bold">
                    Bank A/c. No.{COMPANY.accountNo}, IFSC Code:{COMPANY.ifsc}
                  </span>
                  <br />
                  <span className="font-bold">PAN NO.:{COMPANY.panNo}</span>
                </p>
                <div className="shrink-0 text-center text-xs">
                  <p>for {COMPANY.name}</p>
                  <p className="mt-8">Authorised Signatory</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
