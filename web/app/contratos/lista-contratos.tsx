"use client";

import { useState } from "react";
import { cancelarContrato, type ContratoState } from "@/app/actions";
import type { ContratoComAluno } from "@/app/actions";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatarPlano(plano: ContratoComAluno["plano"]) {
  const planos = {
    MENSAL: "Mensal",
    TRIMESTRAL: "Trimestral",
    SEMESTRAL: "Semestral",
  };
  return planos[plano];
}

function formatarStatus(status: ContratoComAluno["status"]) {
  const statusMap = {
    ATIVO: { label: "Ativo", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
    CANCELADO: { label: "Cancelado", className: "bg-red-100 text-red-800", dot: "bg-red-500" },
    ENCERRADO: { label: "Encerrado", className: "bg-slate-100 text-slate-800", dot: "bg-slate-500" },
  };
  return statusMap[status];
}

export default function ListaContratos({ contratos }: { contratos: ContratoComAluno[] }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<ContratoComAluno["status"] | "TODOS">("TODOS");
  const [planoFiltro, setPlanoFiltro] = useState<ContratoComAluno["plano"] | "TODOS">("TODOS");
  const [estadoCancelar, setEstadoCancelar] = useState<Record<number, ContratoState>>({});
  const [enviandoCancelar, setEnviandoCancelar] = useState<Set<number>>(new Set());

  const consulta = normalizarTexto(busca.trim());

  const contratosFiltrados = contratos.filter((contrato) => {
    const matchBusca = !consulta || normalizarTexto(contrato.alunoNome).includes(consulta);
    const matchStatus = statusFiltro === "TODOS" || contrato.status === statusFiltro;
    const matchPlano = planoFiltro === "TODOS" || contrato.plano === planoFiltro;
    return matchBusca && matchStatus && matchPlano;
  });

  const contratosAtivos = contratos.filter((c) => c.status === "ATIVO").length;

  async function handleCancelar(id: number, _formData: FormData) {
    setEnviandoCancelar((prev) => new Set(prev).add(id));
    setEstadoCancelar((prev) => ({ ...prev, [id]: { status: "idle" } }));

    const resultado = await cancelarContrato(id, { status: "idle" }, _formData);

    setEstadoCancelar((prev) => ({ ...prev, [id]: resultado }));
    setEnviandoCancelar((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <>
      <section aria-label="Resumo de contratos" className="mb-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Total de contratos</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {contratos.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">Contratos cadastrados</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Contratos ativos</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {contratosAtivos}
            </p>
            <p className="mt-1 text-sm text-slate-500">Vigentes no momento</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Encerrados/Cancelados</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {contratos.length - contratosAtivos}
            </p>
            <p className="mt-1 text-sm text-slate-500">Histórico finalizado</p>
          </article>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Os cartões mostram todos os contratos; os filtros afetam apenas a lista.
        </p>
      </section>

      <section
        aria-labelledby="titulo-lista-contratos"
        className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="titulo-lista-contratos" className="text-xl font-bold text-slate-900">
                Lista de contratos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulte e gerencie os contratos dos alunos.
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
              <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:w-auto">
                <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-xs">
                  Status
                  <select
                    value={statusFiltro}
                    onChange={(event) => setStatusFiltro(event.target.value as typeof statusFiltro)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </label>
                <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-xs">
                  Plano
                  <select
                    value={planoFiltro}
                    onChange={(event) => setPlanoFiltro(event.target.value as typeof planoFiltro)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="MENSAL">Mensal</option>
                    <option value="TRIMESTRAL">Trimestral</option>
                    <option value="SEMESTRAL">Semestral</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500" role="status" aria-live="polite">
            {consulta || statusFiltro !== "TODOS" || planoFiltro !== "TODOS"
              ? `${contratosFiltrados.length} de ${contratos.length} ${contratos.length === 1 ? "contrato encontrado" : "contratos encontrados"}`
              : `${contratos.length} ${contratos.length === 1 ? "contrato cadastrado" : "contratos cadastrados"}`}
          </p>
        </div>

        {!contratos.length ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sky-50 text-xl font-bold text-sky-700" aria-hidden="true">
              +
            </div>
            <p className="mt-4 font-bold text-slate-900">Nenhum contrato cadastrado</p>
            <p className="mt-1 text-sm text-slate-500">
              Use &ldquo;Novo contrato&rdquo; para criar o primeiro contrato.
            </p>
          </div>
        ) : !contratosFiltrados.length ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-slate-900">
              Nenhum contrato encontrado com os filtros atuais.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajuste a busca ou os filtros e tente novamente.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setStatusFiltro("TODOS");
                setPlanoFiltro("TODOS");
              }}
              className="mt-4 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contratosFiltrados.map((contrato) => {
              const statusInfo = formatarStatus(contrato.status);
              const cancelando = enviandoCancelar.has(contrato.id);
              const estado = estadoCancelar[contrato.id];

              return (
                <article
                  key={contrato.id}
                  className="px-4 py-5 sm:px-6 hover:bg-slate-50/50 transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-base font-extrabold text-sky-800">
                          {contrato.alunoNome.trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{contrato.alunoNome}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Contrato #{contrato.id} • Aluno #{contrato.alunoId}
                          </p>
                        </div>
                      </div>

                      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-100 py-3 text-sm sm:border-0 sm:py-0">
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Plano</dt>
                          <dd className="font-semibold text-slate-800">{formatarPlano(contrato.plano)}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Início</dt>
                          <dd className="font-semibold text-slate-800">{formatarData(contrato.dataInicio)}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Término</dt>
                          <dd className="font-semibold text-slate-800">{formatarData(contrato.dataTermino)}</dd>
                        </div>
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

                    {contrato.status === "ATIVO" && (
                      <form
                        action={handleCancelar.bind(null, contrato.id)}
                        className="flex gap-2"
                      >
                        {estado?.status === "error" && (
                          <p role="alert" className="hidden sm:block rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                            {estado.message}
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={cancelando}
                          aria-busy={cancelando}
                          onClick={(e) => {
                            if (!window.confirm("Tem certeza que deseja cancelar este contrato? Esta ação não pode ser desfeita.")) {
                              e.preventDefault();
                            }
                          }}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                        >
                          {cancelando && (
                            <span
                              aria-hidden="true"
                              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            />
                          )}
                          <span aria-live="polite">Cancelar</span>
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
            Exibindo {contratosFiltrados.length} de {contratos.length} contratos
          </p>
        </div>
      </section>
    </>
  );
}