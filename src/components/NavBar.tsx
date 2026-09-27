import Link from "next/link";
import { COMPANY } from "@/lib/company";

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
        <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
            KC
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-slate-900">
              {COMPANY.name}
            </span>
            <span className="block text-xs text-slate-500">{COMPANY.city}</span>
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
          <Link
            href="/"
            prefetch={false}
            className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm"
          >
            Invoices
          </Link>
          <Link
            href="/customers"
            prefetch={false}
            className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm"
          >
            Customers
          </Link>
          <Link
            href="/products"
            prefetch={false}
            className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm"
          >
            Stock
          </Link>
          <Link
            href="/invoices/new"
            className="ml-0.5 shrink-0 whitespace-nowrap rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:ml-1 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            + New Sale
          </Link>
        </nav>
      </div>
    </header>
  );
}
