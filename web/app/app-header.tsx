import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          aria-label="Gestão Academia, página de alunos"
        >
          <span className="flex size-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 text-sm font-extrabold tracking-tight text-white shadow-sm">
            G<span className="text-sky-400">A</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-5 text-slate-900 sm:text-base">
              Gestão Academia
            </span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              Painel administrativo
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center">
          <Link
            href="/"
            className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:px-4"
          >
            Alunos
          </Link>
        </nav>
      </div>
    </header>
  );
}
