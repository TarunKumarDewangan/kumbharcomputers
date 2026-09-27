"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Print Invoice
    </button>
  );
}
