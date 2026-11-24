"use client";

import {
  type DashboardStats,
  type AlunoDistribuicaoNivel,
  type AlunoDistribuicaoFrequencia,
  type SessaoSemanaAluno,
  type CobrancasResumo,
  type ValoresPeriodo,
} from "@/app/actions";

function FalhaAoCarregarDashboard({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar o dashboard
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarNumero(valor: number) {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

function getNivelLabel(nivel: AlunoDistribuicaoNivel["nivel"]) {
  const labels = {
    INICIANTE: "Iniciante",
    INTERMEDIARIO: "Intermediário",
    AVANCADO: "Avançado",
  };
  return labels[nivel];
}

function getNivelColor(nivel: AlunoDistribuicaoNivel["nivel"]) {
  const colors = {
    INICIANTE: "bg-emerald-500",
    INTERMEDIARIO: "bg-sky-500",
    AVANCADO: "bg-violet-500",
  };
  return colors[nivel];
}

function getPercentualColor(percentual: number) {
  if (percentual >= 100) return "text-emerald-700 bg-emerald-100";
  if (percentual >= 75) return "text-sky-700 bg-sky-100";
  if (percentual >= 50) return "text-amber-700 bg-amber-100";
  return "text-red-700 bg-red-100";
}

export function CardsResumoAlunos({ stats }: { stats: DashboardStats["alunos"] }) {
  return (
    <section aria-label="Resumo de alunos" className="mb-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Total de alunos</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {formatarNumero(stats.total)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Alunos cadastrados no sistema</p>
        </article>

        <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Alunos ativos</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-700">
            {formatarNumero(stats.ativos)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {stats.total > 0
              ? `${Math.round((stats.ativos / stats.total) * 100)}% do total`
              : "0% do total"}
          </p>
        </article>

        <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Alunos inativos</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-700">
            {formatarNumero(stats.inativos)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {stats.total > 0
              ? `${Math.round((stats.inativos / stats.total) * 100)}% do total`
              : "0% do total"}
          </p>
        </article>
      </div>
    </section>
  );
}

export function CardsDistribuicaoNivel({ stats }: { stats: AlunoDistribuicaoNivel[] }) {
  const total = stats.reduce((sum, s) => sum + s.quantidade, 0);

  return (
    <section aria-label="Distribuição por nível de experiência" className="mb-7">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-bold text-slate-900">Distribuição por nível de experiência</h3>
          <p className="mt-1 text-sm text-slate-500">Quantidade de alunos por nível</p>
        </div>
        <div className="divide-y divide-slate-100 p-4 sm:p-6">
          {stats.map((item) => (
            <div key={item.nivel} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${getNivelColor(item.nivel)}`}
                  aria-hidden="true"
                >
                  {item.nivel === "INICIANTE" ? "I" : item.nivel === "INTERMEDIARIO" ? "M" : "A"}
                </span>
                <span className="font-medium text-slate-900">{getNivelLabel(item.nivel)}</span>
              </div>
              <div className="flex items-center gap-4 text-right min-w-[140px]">
                <span className="font-semibold text-slate-900">{formatarNumero(item.quantidade)}</span>
                <span className="text-sm text-slate-500">
                  {total > 0 ? `${Math.round((item.quantidade / total) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          ))}
          {total === 0 && (
            <div className="text-center py-8 text-slate-500">Nenhum aluno cadastrado</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CardsDistribuicaoFrequencia({ stats }: { stats: AlunoDistribuicaoFrequencia[] }) {
  const total = stats.reduce((sum, s) => sum + s.quantidade, 0);

  return (
    <section aria-label="Distribuição por frequência semanal" className="mb-7">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-bold text-slate-900">Distribuição por frequência semanal</h3>
          <p className="mt-1 text-sm text-slate-500">Quantidade de alunos por dias de treino desejados</p>
        </div>
        <div className="divide-y divide-slate-100 p-4 sm:p-6">
          {stats.map((item) => (
            <div key={item.frequencia} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sm font-bold text-sky-800"
                  aria-hidden="true"
                >
                  {item.frequencia}
                </span>
                <span className="font-medium text-slate-900">{item.frequencia} dias/semana</span>
              </div>
              <div className="flex items-center gap-4 text-right min-w-[140px]">
                <span className="font-semibold text-slate-900">{formatarNumero(item.quantidade)}</span>
                <span className="text-sm text-slate-500">
                  {total > 0 ? `${Math.round((item.quantidade / total) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          ))}
          {total === 0 && (
            <div className="text-center py-8 text-slate-500">Nenhum aluno cadastrado</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TabelaSessoesSemana({ stats }: { stats: SessaoSemanaAluno[] }) {
  return (
    <section aria-label="Sessões concluídas na semana" className="mb-7">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-bold text-slate-900">Sessões concluídas na semana</h3>
          <p className="mt-1 text-sm text-slate-500">Comparação com a frequência desejada por aluno</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Aluno
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Frequência desejada
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Sessões concluídas
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Percentual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    Nenhum aluno cadastrado
                  </td>
                </tr>
              ) : (
                stats.map((item) => (
                  <tr key={item.alunoId} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.alunoNome}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {item.frequenciaDesejada} dias
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {item.sessoesConcluidas}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-bold ${getPercentualColor(item.percentual)}`}
                      >
                        {item.percentual}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function CardsCobrancas({ stats }: { stats: CobrancasResumo }) {
  const cards = [
    { label: "Pagas", valor: stats.pagas, cor: "border-t-emerald-500", textoCor: "text-emerald-700", icone: "✓" },
    { label: "Pendentes", valor: stats.pendentes, cor: "border-t-sky-500", textoCor: "text-sky-700", icone: "⏳" },
    { label: "Atrasadas", valor: stats.atrasadas, cor: "border-t-red-500", textoCor: "text-red-700", icone: "⚠" },
    { label: "Canceladas", valor: stats.canceladas, cor: "border-t-slate-500", textoCor: "text-slate-700", icone: "✕" },
  ];

  return (
    <section aria-label="Resumo de cobranças" className="mb-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`rounded-[20px] border border-slate-200 border-t-4 bg-white p-5 shadow-sm sm:p-6 ${card.cor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight {card.textoCor}">
                  {formatarNumero(card.valor)}
                </p>
              </div>
              <span className="text-2xl" aria-hidden="true">{card.icone}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CardsValoresPeriodo({ stats }: { stats: ValoresPeriodo }) {
  return (
    <section aria-label="Valores do período" className="mb-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Recebido no mês</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-700">
            {formatarMoeda(stats.recebido)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Cobranças pagas no mês atual</p>
        </article>

        <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-500 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Previsto para o mês</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-sky-700">
            {formatarMoeda(stats.previsto)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Cobranças pendentes/atrasadas no mês</p>
        </article>
      </div>
    </section>
  );
}

export { FalhaAoCarregarDashboard };

export default function DashboardStatsView({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <CardsResumoAlunos stats={stats.alunos} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardsDistribuicaoNivel stats={stats.distribuicaoNivel} />
        <CardsDistribuicaoFrequencia stats={stats.distribuicaoFrequencia} />
      </div>
      <TabelaSessoesSemana stats={stats.sessoesSemana} />
      <CardsCobrancas stats={stats.cobrancas} />
      <CardsValoresPeriodo stats={stats.valores} />
    </div>
  );
}