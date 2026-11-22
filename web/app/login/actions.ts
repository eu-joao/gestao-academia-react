"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESSAO,
  credenciaisEsperadas,
  valorDaSessao,
} from "@/lib/sessao";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function entrar(
  _estadoAnterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const esperadas = credenciaisEsperadas();

  if (usuario !== esperadas.usuario || senha !== esperadas.senha) {
    return { status: "error", message: "Usuário ou senha inválidos." };
  }

  (await cookies()).set(COOKIE_SESSAO, await valorDaSessao(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  redirect("/");
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/login");
}
