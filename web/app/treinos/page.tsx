import Link from "next/link";
import { Suspense } from "react";
import ExcluirTreinoButton from "@/app/treinos/excluir-treino-button";
import { mensagemErroApi } from "@/lib/api-error";
import type { Treino } from "@/types/treino";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

type SearchParams = Promise<{ treino?: string }>;

function Falha({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar os treinos
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

async function Feedback({ searchParams }: { searchParams: SearchParams }) {
  const { treino } = await searchParams;

  const mensagens: Record<string, { texto: string; erro: boolean }> = {
    atualizado: { texto: "Treino atualizado com sucesso.", erro: false },
    excluido: { texto: "Treino excluído com sucesso.", erro: false },
    erro: { texto: "Não foi possível concluir a operação. Tente novamente.", erro: true },
  };
  const mensagem = treino ? mensagens[treino] : undefined;

  if (!mensagem) return null;

  return (
    <p
      role={mensagem.erro ? "alert" : "status"}
      className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${mensagem.erro ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
    >
      {mensagem.texto}
    </p>
  );
}

async function ListaTreinos() {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/treinos`, { cache: "no-store" });
  } catch {
    return (
      <Falha mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e atualize a página." />
    );
  }

  if (!res.ok) {
    return (
      <Falha
        mensagem={await mensagemErroApi(
          res,
          "A API não conseguiu carregar os treinos. Tente novamente mais tarde.",
        )}
      />
    );
  }

  let treinos: Treino[] = [];
  let respostaInvalida = false;

  try {
    const dados: unknown = await res.json();
    if (Array.isArray(dados)) {
      treinos = dados as Treino[];
    } else {
      respostaInvalida = true;
    }
  } catch {
    respostaInvalida = true;
  }

  if (respostaInvalida) {
    return <Falha mensagem="A API retornou uma resposta inválida ao carregar os treinos." />;
  }

  return (
    <section
      aria-labelledby="titulo-lista-treinos"
      className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <h2 id="titulo-lista-treinos" className="text-xl font-bold text-slate-900">
          Lista de treinos
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {treinos.length} {treinos.length === 1 ? "treino sincronizado" : "treinos sincronizados"} pelo aplicativo.
        </p>
      </div>

      {!treinos.length ? (
        <div className="px-6 py-14 text-center">
          <p className="font-bold text-slate-900">Nenhum treino sincronizado</p>
          <p className="mt-1 text-sm text-slate-500">
            Os treinos criados no aplicativo mobile aparecem aqui após a sincronização.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 p-4 sm:p-5" aria-label="Treinos">
          {treinos.map((treino) => (
            <li
              key={treino.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:shadow-sm sm:p-5"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{treino.nome}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {treino.categoria || "Sem categoria"}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-3 text-sm md:border-0 md:py-0">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Dia da semana</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{treino.diaSemana}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Duração</dt>
                    <dd className="mt-1 font-semibold text-slate-800">{treino.duracaoMin} min</dd>
                  </div>
                </dl>

                <div className="flex gap-2 md:justify-end">
                  <Link
                    href={`/treinos/${treino.id}/editar`}
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 md:flex-none"
                  >
                    Editar
                  </Link>
                  <ExcluirTreinoButton treinoId={treino.id} treinoNome={treino.nome} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TreinosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
            Gestão de academia
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Treinos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Acompanhe os treinos registrados pelos alunos no aplicativo.
          </p>
        </header>

        <Suspense fallback={null}>
          <Feedback searchParams={searchParams} />
        </Suspense>

        <Suspense
          fallback={
            <div
              role="status"
              aria-busy="true"
              className="rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
            >
              Carregando treinos...
            </div>
          }
        >
          <ListaTreinos />
        </Suspense>
      </div>
    </main>
  );
}
