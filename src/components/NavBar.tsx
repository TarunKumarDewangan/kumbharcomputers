import Link from "next/link";
import { COMPANY } from "@/lib/company";

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            KC
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
              {COMPANY.name}
            </span>
            <span className="block text-xs text-slate-500">{COMPANY.city}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Invoices
          </Link>
          <Link
            href="/invoices/new"
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            + New Sale
          </Link>
        </nav>
      </div>
    </header>
  );
}
