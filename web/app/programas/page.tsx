import { Suspense } from "react";
import ListaProgramas from "@/app/programas/lista-programas";
import { mensagemErroApi } from "@/lib/api-error";
import type { ProgramaTreino } from "@/app/actions";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function FalhaAoCarregarProgramas({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar os programas
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

async function ProgramasLista() {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/programas-treino`, {
      cache: "no-store",
    });
  } catch {
    return (
      <FalhaAoCarregarProgramas
        mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e atualize a página."
      />
    );
  }

  if (!res.ok) {
    return (
      <FalhaAoCarregarProgramas
        mensagem={await mensagemErroApi(
          res,
          "A API não conseguiu carregar os programas. Tente novamente mais tarde.",
        )}
      />
    );
  }

  let programas: ProgramaTreino[] = [];
  let erroResposta: string | null = null;

  try {
    const dados: unknown = await res.json();
    if (!Array.isArray(dados)) {
      erroResposta = "A API retornou uma resposta inválida ao carregar os programas.";
    } else {
      programas = dados as ProgramaTreino[];
    }
  } catch (error) {
    erroResposta = error instanceof TypeError
      ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e atualize a página."
      : "A API retornou uma resposta inválida ao carregar os programas.";
  }

  if (erroResposta) return <FalhaAoCarregarProgramas mensagem={erroResposta} />;

  return <ListaProgramas programas={programas} />;
}

export default function ProgramasPage() {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
              Gestão de academia
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Programas de treino
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Consulte os programas predefinidos e atribua aos alunos.
            </p>
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
              Carregando programas...
            </div>
          }
        >
          <ProgramasLista />
        </Suspense>
      </div>
    </main>
  );
}