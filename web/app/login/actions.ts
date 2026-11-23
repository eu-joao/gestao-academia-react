"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, verifyCredentials, createSessionCookie, SESSION_TTL_SECONDS } from "@/lib/session";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function entrar(
  _estadoAnterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!verifyCredentials(usuario, senha)) {
    return { status: "error", message: "Usuário ou senha inválidos." };
  }

  const sessionCookie = createSessionCookie();
  (await cookies()).set(COOKIE_SESSAO, sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/");
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/login");
}