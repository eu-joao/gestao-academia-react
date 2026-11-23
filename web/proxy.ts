import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESSAO, valorDaSessao } from "@/lib/sessao";

// Protege todas as telas do portal: sem sessão válida, redireciona para /login.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const autenticado =
    request.cookies.get(COOKIE_SESSAO)?.value === (await valorDaSessao());

  if (pathname === "/login") {
    return autenticado
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (!autenticado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ignora arquivos estáticos e recursos internos do Next.js.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
