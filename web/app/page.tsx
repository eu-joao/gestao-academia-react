
import { Suspense } from "react";
import AlunoForm from "@/app/aluno-form";
import ListaAlunos from "@/app/alunos/lista-alunos";
import { mensagemErroApi } from "@/lib/api-error";
import type { Aluno } from "@/types/aluno";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function FalhaAoCarregarAlunos({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar os alunos
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

async function AlunosLista() {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/alunos`, {
      cache: "no-store",
    });
  } catch {
    return (
      <FalhaAoCarregarAlunos mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e atualize a página." />
    );
  }

  if (!res.ok) {
    return (
      <FalhaAoCarregarAlunos
        mensagem={await mensagemErroApi(
          res,
          "A API não conseguiu carregar os alunos. Tente novamente mais tarde.",
        )}
      />
    );
  }

  let alunos: Aluno[] = [];
  let erroResposta: string | null = null;

  try {
    const dados: unknown = await res.json();
    if (!Array.isArray(dados)) {
      erroResposta = "A API retornou uma resposta inválida ao carregar os alunos.";
    } else {
      alunos = dados as Aluno[];
    }
  } catch (error) {
    erroResposta = error instanceof TypeError
      ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e atualize a página."
      : "A API retornou uma resposta inválida ao carregar os alunos.";
  }

  if (erroResposta) return <FalhaAoCarregarAlunos mensagem={erroResposta} />;

  return <ListaAlunos alunos={alunos} />;
}

async function FeedbackExclusao({
  searchParams,
}: {
  searchParams: Promise<{ alunoExcluido?: string }>;
}) {
  const { alunoExcluido } = await searchParams;

  if (alunoExcluido !== "sucesso") return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm"
    >
      Aluno excluído com sucesso.
    </p>
  );
}

export default function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ alunoExcluido?: string }>;
}) {

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
              Gestão de academia
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Alunos cadastrados
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Gerencie e acompanhe os alunos da sua academia.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-44">
            <AlunoForm />
          </div>
        </header>

        <Suspense fallback={null}>
          <FeedbackExclusao searchParams={searchParams} />
        </Suspense>

        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
            >
              Carregando alunos...
            </div>
          }
        >
          <AlunosLista />
        </Suspense>
      </div>
    </main>
  );
}
