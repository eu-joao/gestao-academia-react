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

// Tipos para as listagens
export type ContratoComAluno = {
  id: number;
  alunoId: number;
  alunoNome: string;
  plano: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
  dataInicio: string;
  dataTermino: string;
  status: "ATIVO" | "CANCELADO" | "ENCERRADO";
};

export type PlanoInfo = {
  tipo: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
  duracaoMeses: number;
  valorMensal: number;
};

export type AlunoParaContrato = {
  id: number;
  nome: string;
  status: "ATIVO" | "INATIVO";
};

export async function listarContratos(): Promise<ContratoComAluno[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/contratos`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as Array<{
    id: number;
    alunoId: number;
    plano: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
    dataInicio: string;
    dataTermino: string;
    status: "ATIVO" | "CANCELADO" | "ENCERRADO";
  }>;

  // Buscar nomes dos alunos
  const alunosResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8080"}/alunos`, { cache: "no-store" });
  const alunos: AlunoParaContrato[] = alunosResponse.ok ? await alunosResponse.json() : [];
  const alunosMap = new Map(alunos.map(a => [a.id, a.nome]));

  return data.map(c => ({
    ...c,
    alunoNome: alunosMap.get(c.alunoId) ?? `Aluno #${c.alunoId}`,
  }));
}

export async function listarPlanos(): Promise<PlanoInfo[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/planos`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<PlanoInfo[]>;
}

export async function listarAlunosParaContrato(): Promise<AlunoParaContrato[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  const data = await response.json() as Array<{
    id: number;
    nome: string;
    status: "ATIVO" | "INATIVO";
  }>;

  // Retornar todos os alunos (o backend valida RN03: impede 2º contrato ativo)
  // Alunos INATIVOS ficam ATIVOS ao criar o contrato (RN05)
  return data;
}

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

export type StatusCobranca = "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";

export type CobrancaComContrato = {
  id: number;
  contratoId: number;
  alunoId: number;
  alunoNome: string;
  numeroParcela: number;
  dataVencimento: string;
  valor: number;
  status: StatusCobranca;
  dataPagamento: string | null;
};

export type CobrancaState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function listarCobrancas(): Promise<CobrancaComContrato[]> {
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

  const data = await response.json() as Array<{
    id: number;
    contratoId: number;
    numeroParcela: number;
    dataVencimento: string;
    valor: number;
    status: StatusCobranca;
    dataPagamento: string | null;
  }>;

  // Buscar nomes dos alunos via contratos
  const contratosResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8080"}/contratos`, { cache: "no-store" });
  const contratos: Array<{ id: number; alunoId: number }> = contratosResponse.ok ? await contratosResponse.json() : [];
  const contratoAlunoMap = new Map(contratos.map(c => [c.id, c.alunoId]));

  const alunosResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8080"}/alunos`, { cache: "no-store" });
  const alunos: Array<{ id: number; nome: string }> = alunosResponse.ok ? await alunosResponse.json() : [];
  const alunosMap = new Map(alunos.map(a => [a.id, a.nome]));

  return data.map(c => ({
    ...c,
    alunoId: contratoAlunoMap.get(c.contratoId) ?? 0,
    alunoNome: alunosMap.get(contratoAlunoMap.get(c.contratoId) ?? 0) ?? `Aluno #${contratoAlunoMap.get(c.contratoId) ?? "?"}`,
  }));
}

export async function listarCobrancasDoContrato(contratoId: number): Promise<CobrancaComContrato[]> {
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

  const data = await response.json() as Array<{
    id: number;
    contratoId: number;
    numeroParcela: number;
    dataVencimento: string;
    valor: number;
    status: StatusCobranca;
    dataPagamento: string | null;
  }>;

  // Buscar nome do aluno
  const contratoResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8080"}/contratos/${contratoId}`, { cache: "no-store" });
  let alunoId = 0;
  let alunoNome = "Desconhecido";
  if (contratoResponse.ok) {
    const contrato = await contratoResponse.json() as { alunoId: number };
    alunoId = contrato.alunoId;
    const alunoResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8080"}/alunos/${alunoId}`, { cache: "no-store" });
    if (alunoResponse.ok) {
      const aluno = await alunoResponse.json() as { nome: string };
      alunoNome = aluno.nome;
    }
  }

  return data.map(c => ({
    ...c,
    alunoId,
    alunoNome,
  }));
}

export async function marcarPago(
  id: number,
  _previousState: CobrancaState,
  _formData: FormData,
): Promise<CobrancaState> {
  await requireAuth();
  void _previousState;
  void _formData;

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    // Endpoint para o personal confirmar pagamento (precisa ser implementado no backend)
    response = await fetch(`${apiUrl}/cobrancas/${id}/confirmar-pagamento`, {
      method: "POST",
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
      message: await mensagemErroApi(response, "Não foi possível confirmar o pagamento. Tente novamente."),
    };
  }

  revalidatePath("/cobrancas");
  return { status: "success", message: "Pagamento confirmado com sucesso." };
}

// ==================== PROGRAMAS DE TREINO ====================

export type NivelExperiencia = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
export type TipoEstrutural = "FULLBODY" | "UPPER_LOWER" | "PPL_UPPER_LOWER" | "PPL_2X";

export type DiaTreino = {
  id: number;
  programaTreinoId: number;
  nome: string;
  ordem: number;
  itens: Array<{
    id: number;
    diaTreinoId: number;
    nomeExercicio: string;
    musculaturaAlvo: string;
    series: number;
    repeticoes: string;
    ordem: number;
  }>;
};

export type ProgramaTreino = {
  id: number;
  nivelExperiencia: NivelExperiencia;
  frequenciaSemanal: number;
  tipoEstrutural: TipoEstrutural;
  descricao: string;
  dias: DiaTreino[];
};

export type ProgramaState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type AlunoParaPrograma = {
  id: number;
  nome: string;
  nivelExperiencia: NivelExperiencia;
  frequenciaSemanal: number;
  programaAtualId: number | null;
};

export async function listarProgramas(): Promise<ProgramaTreino[]> {
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

  return response.json() as Promise<ProgramaTreino[]>;
}

export async function listarAlunosParaPrograma(): Promise<AlunoParaPrograma[]> {
  await requireAuth();

  let response: Response;

  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:8080";
    response = await fetch(`${apiUrl}/alunos`, { cache: "no-store" });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json() as Promise<AlunoParaPrograma[]>;
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
