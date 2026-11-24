"use server";

import { revalidatePath } from "next/cache";
import { mensagemErroApi } from "@/lib/api-error";
import type { ContratoRequest } from "@/types/contrato";
import { requireAuth } from "@/lib/require-auth";

export type CadastroAlunoState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type AlunoAdminPayload = {
  nome: string;
  email: string;
  peso: number;
  altura: number;
  nivelExperiencia: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  frequenciaSemanal: number;
};

type AlunoUpdatePayload = {
  peso: number;
  altura: number;
  nivelExperiencia: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  frequenciaSemanal: number;
};

export async function cadastrarAluno(
  _previousState: CadastroAlunoState,
  formData: FormData,
): Promise<CadastroAlunoState> {
  await requireAuth();
  return cadastrarAlunoAdmin(formData);
}

export async function atualizarAluno(
  id: number,
  _previousState: CadastroAlunoState,
  formData: FormData,
): Promise<CadastroAlunoState> {
  await requireAuth();
  return atualizarAlunoComoPersonal(id, formData);
}

async function cadastrarAlunoAdmin(
  formData: FormData,
): Promise<CadastroAlunoState> {
  const payload: AlunoAdminPayload = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    peso: Number(formData.get("peso")),
    altura: Number(formData.get("altura")),
    nivelExperiencia: String(
      formData.get("nivelExperiencia") ?? "",
    ) as AlunoAdminPayload["nivelExperiencia"],
    frequenciaSemanal: Number(formData.get("frequenciaSemanal")),
  };

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos`, {
      method: "POST",
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
    return { status: "error", message: await mensagemErroApi(response, "Não foi possível cadastrar o aluno. Confira os dados e tente novamente.") };
  }

  revalidatePath("/");
  return {
    status: "success",
    message: "Aluno cadastrado com sucesso.",
  };
}

async function atualizarAlunoComoPersonal(
  id: number,
  formData: FormData,
): Promise<CadastroAlunoState> {
  const payload: AlunoUpdatePayload = {
    peso: Number(formData.get("peso")),
    altura: Number(formData.get("altura")),
    nivelExperiencia: String(
      formData.get("nivelExperiencia") ?? "",
    ) as AlunoUpdatePayload["nivelExperiencia"],
    frequenciaSemanal: Number(formData.get("frequenciaSemanal")),
  };

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos/${id}`, {
      method: "PUT",
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
    return { status: "error", message: await mensagemErroApi(response, "Não foi possível atualizar o aluno. Confira os dados e tente novamente.") };
  }

  revalidatePath("/");
  return {
    status: "success",
    message: "Aluno atualizado com sucesso.",
  };
}

// ==================== CONTRATOS ====================

export type ContratoState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function criarContrato(
  _previousState: ContratoState,
  formData: FormData,
): Promise<ContratoState> {
  await requireAuth();

  const payload: ContratoRequest = {
    alunoId: Number(formData.get("alunoId")),
    plano: String(formData.get("plano") ?? "") as ContratoRequest["plano"],
    dataInicio: String(formData.get("dataInicio") ?? ""),
  };

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/contratos`, {
      method: "POST",
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
    return { status: "error", message: await mensagemErroApi(response, "Não foi possível criar o contrato. Confira os dados e tente novamente.") };
  }

  revalidatePath("/contratos");
  return { status: "success", message: "Contrato criado com sucesso." };
}

export async function cancelarContrato(
  id: number,
  _previousState: ContratoState,
  _formData: FormData,
): Promise<ContratoState> {
  await requireAuth();
  void _previousState;
  void _formData;

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/contratos/${id}/cancelar`, {
      method: "PUT",
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
      message: await mensagemErroApi(response, "Não foi possível cancelar o contrato. Tente novamente."),
    };
  }

  revalidatePath("/contratos");
  return { status: "success", message: "Contrato cancelado com sucesso." };
}

// ==================== COBRANÇAS ====================

export async function listarCobrancas(): Promise<unknown[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/cobrancas`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<unknown[]>;
}

export async function listarCobrancasDoContrato(contratoId: number): Promise<unknown[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/cobrancas/contrato/${contratoId}`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<unknown[]>;
}

// ==================== PROGRAMAS DE TREINO ====================

export type ProgramaState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function listarProgramas(): Promise<unknown[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/programas-treino`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<unknown[]>;
}

export async function atribuirProgramaAluno(
  alunoId: number,
  programaId: number,
  _previousState: ProgramaState,
  _formData: FormData,
): Promise<ProgramaState> {
  await requireAuth();
  void _previousState;
  void _formData;

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos/${alunoId}/programa/${programaId}`, {
      method: "PUT",
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
      message: await mensagemErroApi(response, "Não foi possível atribuir o programa ao aluno. Tente novamente."),
    };
  }

  revalidatePath("/alunos");
  revalidatePath("/programas");
  return { status: "success", message: "Programa atribuído com sucesso." };
}
