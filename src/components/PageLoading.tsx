export function PageLoading() {
  return (
    <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-24 sm:px-6">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
          />
        </svg>
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}
