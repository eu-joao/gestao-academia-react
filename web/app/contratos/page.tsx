import { Suspense } from "react";
import ContratoForm from "@/app/contratos/contrato-form";
import ListaContratos from "@/app/contratos/lista-contratos";
import { mensagemErroApi } from "@/lib/api-error";
import type { ContratoComAluno } from "@/app/actions";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function FalhaAoCarregarContratos({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar os contratos
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

async function ContratosLista() {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/contratos`, {
      cache: "no-store",
    });
  } catch {
    return (
      <FalhaAoCarregarContratos
        mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e atualize a página."
      />
    );
  }

  if (!res.ok) {
    return (
      <FalhaAoCarregarContratos
        mensagem={await mensagemErroApi(
          res,
          "A API não conseguiu carregar os contratos. Tente novamente mais tarde.",
        )}
      />
    );
  }

  let contratos: ContratoComAluno[] = [];
  let erroResposta: string | null = null;

  try {
    const dados: unknown = await res.json();
    if (!Array.isArray(dados)) {
      erroResposta = "A API retornou uma resposta inválida ao carregar os contratos.";
    } else {
      const contratosBasicos = dados as Array<{
        id: number;
        alunoId: number;
        plano: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
        dataInicio: string;
        dataTermino: string;
        status: "ATIVO" | "CANCELADO" | "ENCERRADO";
      }>;

      // Buscar nomes dos alunos
      let alunosRes: Response;
      try {
        alunosRes = await fetch(`${API_URL}/alunos`, { cache: "no-store" });
      } catch {
        alunosRes = { ok: false } as Response;
      }

      const alunos: Array<{ id: number; nome: string; status: "ATIVO" | "INATIVO" }> = alunosRes.ok
        ? await alunosRes.json()
        : [];

      const alunosMap = new Map(alunos.map((a) => [a.id, a.nome]));

      contratos = contratosBasicos.map((c) => ({
        ...c,
        alunoNome: alunosMap.get(c.alunoId) ?? `Aluno #${c.alunoId}`,
      }));
    }
  } catch (error) {
    erroResposta = error instanceof TypeError
      ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e atualize a página."
      : "A API retornou uma resposta inválida ao carregar os contratos.";
  }

  if (erroResposta) return <FalhaAoCarregarContratos mensagem={erroResposta} />;

  return <ListaContratos contratos={contratos} />;
}

export default function ContratosPage() {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
              Gestão de academia
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Contratos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Gerencie os contratos dos alunos da academia.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-44">
            <ContratoForm />
          </div>
        </header>

        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
            >
              Carregando contratos...
            </div>
          }
        >
          <ContratosLista />
        </Suspense>
      </div>
    </main>
  );
}