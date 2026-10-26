"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mensagemErroApi } from "@/lib/api-error";
import type { AlunoRequest } from "@/types/aluno";

export type CadastroAlunoState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function cadastrarAluno(
  _previousState: CadastroAlunoState,
  formData: FormData,
): Promise<CadastroAlunoState> {
  return salvarAluno("POST", "/alunos", formData);
}

export async function atualizarAluno(
  id: number,
  _previousState: CadastroAlunoState,
  formData: FormData,
): Promise<CadastroAlunoState> {
  return salvarAluno("PUT", `/alunos/${id}`, formData);
}

async function salvarAluno(
  method: "POST" | "PUT",
  path: string,
  formData: FormData,
): Promise<CadastroAlunoState> {
  const payload: AlunoRequest = {
    nome: String(formData.get("nome") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? "").replace(/\D/g, ""),
    telefone: String(formData.get("telefone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    dataNascimento: String(formData.get("dataNascimento") ?? ""),
    peso: Number(formData.get("peso")),
    altura: Number(formData.get("altura")),
    nivelExperiencia: String(
      formData.get("nivelExperiencia") ?? "",
    ) as AlunoRequest["nivelExperiencia"],
    frequenciaSemanal: Number(formData.get("frequenciaSemanal")),
    status: String(formData.get("status") ?? "ATIVO") as AlunoRequest["status"],
  };

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return {
      status: "error",
      message: "Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e tente novamente.",
    };
  }

  if (!response.ok) {
    const fallback = method === "POST"
      ? "Não foi possível cadastrar o aluno. Confira os dados e tente novamente."
      : "Não foi possível atualizar o aluno. Confira os dados e tente novamente.";
    return { status: "error", message: await mensagemErroApi(response, fallback) };
  }

  revalidatePath("/");
  return {
    status: "success",
    message: method === "POST" ? "Aluno cadastrado com sucesso." : "Aluno atualizado com sucesso.",
  };
}

export async function excluirAluno(
  id: number,
  _previousState: CadastroAlunoState,
  _formData: FormData,
): Promise<CadastroAlunoState> {
  void _previousState;
  void _formData;

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    return {
      status: "error",
      message: "Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e tente novamente.",
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: await mensagemErroApi(response, "Não foi possível excluir o aluno. Tente novamente."),
    };
  }

  revalidatePath("/");
  redirect("/?alunoExcluido=sucesso");
}
