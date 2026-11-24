import { Suspense } from "react";
import { connection } from "next/server";
import DashboardStatsView, { FalhaAoCarregarDashboard } from "@/app/dashboard/dashboard-stats";
import { obterDashboardStats } from "@/app/actions";

async function DashboardLista() {
  await connection();

  let stats: Awaited<ReturnType<typeof obterDashboardStats>>;
  let erroResposta: string | null = null;

  try {
    stats = await obterDashboardStats();
  } catch (error) {
    erroResposta =
      error instanceof TypeError
        ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e atualize a página."
        : "Não foi possível carregar o dashboard. Tente novamente mais tarde.";
  }

  if (erroResposta) return <FalhaAoCarregarDashboard mensagem={erroResposta} />;

  return <DashboardStatsView stats={stats!} />;
}

export default function DashboardPage() {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
              Gestão de academia
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Acompanhamento de alunos, treinos e financeiro da academia.
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
              Carregando dashboard...
            </div>
          }
        >
          <DashboardLista />
        </Suspense>
      </div>
    </main>
  );
}