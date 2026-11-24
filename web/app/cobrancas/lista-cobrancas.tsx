"use client";

import { useState } from "react";
import { marcarPago, type CobrancaComContrato, type CobrancaState } from "@/app/actions";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarStatus(status: CobrancaComContrato["status"]) {
  const statusMap = {
    PENDENTE: { label: "Pendente", className: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
    PAGO: { label: "Pago", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
    ATRASADO: { label: "Atrasado", className: "bg-red-100 text-red-800", dot: "bg-red-500" },
    CANCELADO: { label: "Cancelado", className: "bg-slate-100 text-slate-800", dot: "bg-slate-500" },
  };
  return statusMap[status];
}

export default function ListaCobrancas({ cobrancas }: { cobrancas: CobrancaComContrato[] }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<CobrancaComContrato["status"] | "TODOS">("TODOS");
  const [estadoMarcarPago, setEstadoMarcarPago] = useState<Record<number, CobrancaState>>({});
  const [enviandoMarcarPago, setEnviandoMarcarPago] = useState<Set<number>>(new Set());

  const consulta = normalizarTexto(busca.trim());

  const cobrancasFiltradas = cobrancas.filter((cobranca) => {
    const matchBusca = !consulta || normalizarTexto(cobranca.alunoNome).includes(consulta);
    const matchStatus = statusFiltro === "TODOS" || cobranca.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const pendentes = cobrancas.filter((c) => c.status === "PENDENTE").length;
  const pagas = cobrancas.filter((c) => c.status === "PAGO").length;
  const atrasadas = cobrancas.filter((c) => c.status === "ATRASADO").length;
  const valorPendente = cobrancas.filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO").reduce((s, c) => s + c.valor, 0);
  const valorPago = cobrancas.filter((c) => c.status === "PAGO").reduce((s, c) => s + c.valor, 0);

  async function handleMarcarPago(id: number, _formData: FormData) {
    setEnviandoMarcarPago((prev) => new Set(prev).add(id));
    setEstadoMarcarPago((prev) => ({ ...prev, [id]: { status: "idle" } }));

    const resultado = await marcarPago(id, { status: "idle" }, _formData);

    setEstadoMarcarPago((prev) => ({ ...prev, [id]: resultado }));
    setEnviandoMarcarPago((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <>
      <section aria-label="Resumo de cobranças" className="mb-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Pendentes</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {pendentes}
            </p>
            <p className="mt-1 text-sm text-slate-500">Aguardando pagamento</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-red-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Atrasadas</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {atrasadas}
            </p>
            <p className="mt-1 text-sm text-slate-500">Vencimento expirado</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Pagas</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {pagas}
            </p>
            <p className="mt-1 text-sm text-slate-500">Confirmadas</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">A receber</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatarValor(valorPendente)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Pendentes + Atrasadas</p>
          </article>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Recebido no período</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {formatarValor(valorPago)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Total confirmado</p>
          </article>
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-slate-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Total de cobranças</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {cobrancas.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">Todas as parcelas geradas</p>
          </article>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Os cartões mostram todas as cobranças; os filtros afetam apenas a lista.
        </p>
      </section>

      <section
        aria-labelledby="titulo-lista-cobrancas"
        className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="titulo-lista-cobrancas" className="text-xl font-bold text-slate-900">
                Lista de cobranças
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe vencimentos, pagamentos e situação financeira.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-end sm:w-auto">
              <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-xs">
                Buscar por aluno
                <input
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Nome do aluno..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-xs">
                Status
                <select
                  value={statusFiltro}
                  onChange={(event) => setStatusFiltro(event.target.value as typeof statusFiltro)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="ATRASADO">Atrasado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </label>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500" role="status" aria-live="polite">
            {consulta || statusFiltro !== "TODOS"
              ? `${cobrancasFiltradas.length} de ${cobrancas.length} ${cobrancas.length === 1 ? "cobrança encontrada" : "cobranças encontradas"}`
              : `${cobrancas.length} ${cobrancas.length === 1 ? "cobrança cadastrada" : "cobranças cadastradas"}`}
          </p>
        </div>

        {!cobrancas.length ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sky-50 text-xl font-bold text-sky-700" aria-hidden="true">
              $
            </div>
            <p className="mt-4 font-bold text-slate-900">Nenhuma cobrança cadastrada</p>
            <p className="mt-1 text-sm text-slate-500">
              As cobranças são geradas automaticamente ao criar contratos.
            </p>
          </div>
        ) : !cobrancasFiltradas.length ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-slate-900">
              Nenhuma cobrança encontrada com os filtros atuais.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajuste a busca ou os filtros e tente novamente.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setStatusFiltro("TODOS");
              }}
              className="mt-4 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cobrancasFiltradas.map((cobranca) => {
              const statusInfo = formatarStatus(cobranca.status);
              const marcando = enviandoMarcarPago.has(cobranca.id);
              const estado = estadoMarcarPago[cobranca.id];
              const podeMarcarPago = cobranca.status === "PENDENTE" || cobranca.status === "ATRASADO";

              return (
                <article
                  key={cobranca.id}
                  className="px-4 py-5 sm:px-6 hover:bg-slate-50/50 transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-base font-extrabold text-amber-800">
                          $
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{cobranca.alunoNome}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Parcela {cobranca.numeroParcela} • Contrato #{cobranca.contratoId} • Aluno #{cobranca.alunoId}
                          </p>
                        </div>
                      </div>

                      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-100 py-3 text-sm sm:border-0 sm:py-0">
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Vencimento</dt>
                          <dd className="font-semibold text-slate-800">{formatarData(cobranca.dataVencimento)}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Valor</dt>
                          <dd className="font-semibold text-slate-800">{formatarValor(cobranca.valor)}</dd>
                        </div>
                        {cobranca.dataPagamento && (
                          <div className="flex items-center gap-2">
                            <dt className="text-xs font-medium text-slate-500">Pagamento</dt>
                            <dd className="font-semibold text-slate-800">{formatarData(cobranca.dataPagamento)}</dd>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Status</dt>
                          <dd>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                            >
                              <span
                                className={`size-2 rounded-full ${statusInfo.dot}`}
                                aria-hidden="true"
                              />
                              {statusInfo.label}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {podeMarcarPago && (
                      <form
                        action={handleMarcarPago.bind(null, cobranca.id)}
                        className="flex gap-2"
                      >
                        {estado?.status === "error" && (
                          <p role="alert" className="hidden sm:block rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                            {estado.message}
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={marcando}
                          aria-busy={marcando}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                        >
                          {marcando && (
                            <span
                              aria-hidden="true"
                              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            />
                          )}
                          <span aria-live="polite">Marcar pago</span>
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Exibindo {cobrancasFiltradas.length} de {cobrancas.length} cobranças
          </p>
        </div>
      </section>
    </>
  );
}