"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mensagemErroApi } from "@/lib/api-error";
import type { TreinoRequest } from "@/types/treino";

export type TreinoState =
  | { status: "idle" }
  | { status: "error"; message: string };

const FALHA_CONEXAO =
  "Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e tente novamente.";

export async function atualizarTreino(
  id: string,
  _estadoAnterior: TreinoState,
  formData: FormData,
): Promise<TreinoState> {
  const payload: TreinoRequest = {
    nome: String(formData.get("nome") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? "").trim(),
    diaSemana: String(formData.get("diaSemana") ?? "").trim(),
    duracaoMin: Number(formData.get("duracaoMin")),
  };

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/treinos/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { status: "error", message: FALHA_CONEXAO };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: await mensagemErroApi(
        response,
        "Não foi possível atualizar o treino. Confira os dados e tente novamente.",
      ),
    };
  }

  revalidatePath("/treinos");
  redirect("/treinos?treino=atualizado");
}

export async function excluirTreino(id: string): Promise<void> {
  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/treinos/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    redirect("/treinos?treino=erro");
  }

  if (!response.ok) redirect("/treinos?treino=erro");

  revalidatePath("/treinos");
  redirect("/treinos?treino=excluido");
}
