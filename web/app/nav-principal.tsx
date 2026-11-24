"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/login/actions";

const links = [
  { href: "/", rotulo: "Alunos" },
  { href: "/treinos", rotulo: "Treinos" },
];

export default function NavPrincipal() {
  const pathname = usePathname();

  // Na tela de login não há navegação nem botão de sair.
  if (pathname === "/login") return null;

  return (
    <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-2">
      {links.map(({ href, rotulo }) => {
        const ativo = href === "/" ? pathname === "/" || pathname.startsWith("/alunos") : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:px-4 ${ativo ? "bg-sky-50 text-sky-800 hover:bg-sky-100" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {rotulo}
          </Link>
        );
      })}

      <form action={sair}>
        <button
          type="submit"
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:px-4"
        >
          Sair
        </button>
      </form>
    </nav>
  );
}
