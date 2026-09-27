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

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <div
      id="invoice"
      className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[8mm] text-black shadow-xl print:min-h-0 print:w-full print:p-[8mm] print:shadow-none"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="inline-block border-b-2 border-black px-1 pb-1 text-[22px] font-bold tracking-[3px]">
          INVOICE
        </h1>
      </div>

      {/* Seller and Invoice Details */}
      <div className="grid grid-cols-[58%_42%] border-2 border-black">
        <div className="min-h-[63mm] border-r-2 border-black p-4">
          <h2 className="text-[20px] font-bold leading-6">{COMPANY.name}</h2>
          <p className="text-[16px] font-semibold">{COMPANY.city}</p>

          <div className="mt-2 space-y-1 text-[11px] text-gray-800">
            <p>GST NO.: {COMPANY.gstNo}</p>
            <p>{COMPANY.stateCode}</p>
            <p>E-mail: {COMPANY.email}</p>
            <p>Mobile No: {COMPANY.mobiles}</p>
          </div>
        </div>

        <div className="text-[12px]">
          <div className="min-h-[15mm] border-b border-black p-2">
            <p className="text-[10px]">INVOICE NO</p>
            <p className="mt-1 font-semibold">{invoice.invoice_no}</p>
          </div>

          <div className="min-h-[15mm] border-b border-black p-2">
            <p className="text-[10px]">DATE</p>
            <p className="mt-1 font-semibold">{formatDate(invoice.invoice_date)}</p>
          </div>

          <div className="min-h-[15mm] border-b border-black p-2">
            <p className="text-[10px]">Order No.</p>
            {invoice.order_no && <p className="mt-1 font-semibold">{invoice.order_no}</p>}
          </div>

          <div className="flex min-h-[18mm] flex-col justify-center p-2">
            <p className="text-[10px]">Terms of Payment</p>
            {invoice.terms_of_payment && (
              <p className="mt-1 font-semibold">{invoice.terms_of_payment}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mt-2 border-2 border-black p-4">
        <p className="mb-2 text-[12px]">TO (Bill To)</p>

        <div className="space-y-2 text-[13px]">
          <p className="font-semibold">{invoice.customer_name}</p>
          {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
          {invoice.customer_address && <p className="font-semibold">{invoice.customer_address}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-2">
        <table className="w-full table-fixed border-collapse text-[12px]">
          <thead>
            <tr className="h-[15mm]">
              <th className="w-[5.5%] border border-black px-1">S.N</th>
              <th className="w-[49%] border border-black px-2">Description</th>
              <th className="w-[15%] border border-black px-1">QTY</th>
              <th className="w-[20%] border border-black px-1">
                <div>Rate</div>
                <div className="mt-1 text-[10px] font-normal">(GST 18% Incl.)</div>
              </th>
              <th className="w-[10.5%] border border-black px-1">Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id} className="h-[17mm]">
                <td className="border border-black text-center">{item.sno}</td>
                <td className="border border-black px-3">
                  {item.description}
                  {item.item_serial && (
                    <span className="block text-[10px] text-gray-600">
                      (S.NO- {item.item_serial})
                    </span>
                  )}
                </td>
                <td className="border border-black text-center">{item.qty}</td>
                <td className="border border-black px-2 text-right">{formatMoney(item.rate)}</td>
                <td className="border border-black px-2 text-right">{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Amount in Words and Total */}
      <div className="mt-2 grid grid-cols-[66%_34%] border-2 border-black">
        <div className="min-h-[24mm] border-r-2 border-black p-4">
          <p className="text-[12px] text-gray-600">Amount in words</p>
          <p className="mt-2 text-[12px] font-bold">{invoice.amount_in_words}</p>
        </div>

        <div className="flex items-center justify-between gap-2 p-4">
          <p className="text-[13px] font-bold leading-5">
            Grand
            <br />
            Total:
          </p>
          <p className="border-b-4 border-gray-400 px-2 pb-1 text-[28px] font-bold leading-none">
            {formatMoney(invoice.total_amount)}
          </p>
        </div>
      </div>

      {/* Declaration and Signature */}
      <div className="mt-2 grid grid-cols-[66%_34%] border-2 border-black">
        <div className="min-h-[43mm] border-r-2 border-black p-4">
          <p className="text-[12px] leading-5">
            We declare that this invoice shows the actual price of the goods described
            and that all particulars are true and correct.
          </p>

          <div className="mt-2 space-y-1 text-[11px]">
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

        <div className="flex min-h-[43mm] flex-col justify-between p-4 text-center">
          <p className="text-[12px]">
            For <strong>{COMPANY.name}</strong>
          </p>
          <div className="mx-1 border-b border-dotted border-black" />
          <p className="text-[12px]">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}
