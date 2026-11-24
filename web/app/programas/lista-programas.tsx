"use client";

import { useState } from "react";
import { atribuirProgramaAluno, listarAlunosParaPrograma, type ProgramaState, type ProgramaTreino, type AlunoParaPrograma } from "@/app/actions";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function formatarNivel(nivel: ProgramaTreino["nivelExperiencia"]) {
  const niveis = {
    INICIANTE: "Iniciante",
    INTERMEDIARIO: "Intermediário",
    AVANCADO: "Avançado",
  };
  return niveis[nivel];
}

function formatarTipo(tipo: ProgramaTreino["tipoEstrutural"]) {
  const tipos = {
    FULLBODY: "Full Body",
    UPPER_LOWER: "Upper / Lower",
    PPL_UPPER_LOWER: "PPL + Upper/Lower",
    PPL_2X: "PPL 2x",
  };
  return tipos[tipo];
}

function formatarFrequencia(freq: number) {
  return `${freq} dias/semana`;
}

export default function ListaProgramas({ programas }: { programas: ProgramaTreino[] }) {
  const [busca, setBusca] = useState("");
  const [alunos, setAlunos] = useState<AlunoParaPrograma[]>([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [estadoAtribuir, setEstadoAtribuir] = useState<Record<number, ProgramaState>>({});
  const [enviandoAtribuir, setEnviandoAtribuir] = useState<Set<number>>(new Set());
  const [programaSelecionado, setProgramaSelecionado] = useState<number | null>(null);

  const consulta = normalizarTexto(busca.trim());

  const programasFiltrados = programas.filter((programa) => {
    const matchBusca = !consulta ||
      normalizarTexto(programa.descricao).includes(consulta) ||
      normalizarTexto(formatarNivel(programa.nivelExperiencia)).includes(consulta) ||
      normalizarTexto(formatarTipo(programa.tipoEstrutural)).includes(consulta);
    return matchBusca;
  });

  const totalProgramas = programas.length;

  async function carregarAlunos() {
    setCarregandoAlunos(true);
    const data = await listarAlunosParaPrograma();
    setAlunos(data);
    setCarregandoAlunos(false);
  }

  async function handleAtribuir(programaId: number, _formData: FormData) {
    const alunoId = Number(_formData.get("alunoId"));
    if (!alunoId) return;

    setEnviandoAtribuir((prev) => new Set(prev).add(programaId));
    setEstadoAtribuir((prev) => ({ ...prev, [programaId]: { status: "idle" } }));

    const resultado = await atribuirProgramaAluno(alunoId, programaId, { status: "idle" }, _formData);

    setEstadoAtribuir((prev) => ({ ...prev, [programaId]: resultado }));
    setEnviandoAtribuir((prev) => {
      const next = new Set(prev);
      next.delete(programaId);
      return next;
    });
    setProgramaSelecionado(null);

    if (resultado.status === "success") {
      carregarAlunos();
    }
  }

  function abrirModalAtribuir(programaId: number) {
    if (carregandoAlunos || !alunos.length) {
      carregarAlunos();
    }
    setProgramaSelecionado(programaId);
  }

  function fecharModal() {
    setProgramaSelecionado(null);
  }

  return (
    <>
      <section aria-label="Resumo de programas" className="mb-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Total de programas</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {totalProgramas}
            </p>
            <p className="mt-1 text-sm text-slate-500">Programas predefinidos disponíveis</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Com alunos atribuídos</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {alunos.filter((a) => a.programaAtualId !== null).length}
            </p>
            <p className="mt-1 text-sm text-slate-500">Alunos com programa ativo</p>
          </article>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Os cartões mostram todos os programas; a busca filtra apenas a lista.
        </p>
      </section>

      <section
        aria-labelledby="titulo-lista-programas"
        className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="titulo-lista-programas" className="text-xl font-bold text-slate-900">
                Programas de treino
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulte os programas disponíveis e atribua aos alunos.
              </p>
            </div>
            <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-xs">
              Buscar programa
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Descrição, nível, tipo..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500" role="status" aria-live="polite">
            {consulta
              ? `${programasFiltrados.length} de ${programas.length} ${programas.length === 1 ? "programa encontrado" : "programas encontrados"}`
              : `${programas.length} ${programas.length === 1 ? "programa disponível" : "programas disponíveis"}`}
          </p>
        </div>

        {!programas.length ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sky-50 text-xl font-bold text-sky-700" aria-hidden="true">
              📋
            </div>
            <p className="mt-4 font-bold text-slate-900">Nenhum programa cadastrado</p>
            <p className="mt-1 text-sm text-slate-500">
              Os programas são carregados como dados iniciais do sistema.
            </p>
          </div>
        ) : !programasFiltrados.length ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-slate-900">
              Nenhum programa encontrado para “{busca.trim()}”.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Confira a busca e tente novamente.
            </p>
            <button
              type="button"
              onClick={() => setBusca("")}
              className="mt-4 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {programasFiltrados.map((programa) => {
              const atribuindo = enviandoAtribuir.has(programa.id);
              const alunosComEstePrograma = alunos.filter((a) => a.programaAtualId === programa.id).length;

              return (
                <article
                  key={programa.id}
                  className="px-4 py-5 sm:px-6 hover:bg-slate-50/50 transition"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-base font-extrabold text-sky-800">
                          {programa.id}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{programa.descricao || `Programa #${programa.id}`}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Nível: {formatarNivel(programa.nivelExperiencia)} • {formatarFrequencia(programa.frequenciaSemanal)} • {formatarTipo(programa.tipoEstrutural)}
                          </p>
                        </div>
                      </div>

                      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-100 py-3 text-sm sm:border-0 sm:py-0">
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Dias</dt>
                          <dd className="font-semibold text-slate-800">{programa.dias?.length ?? 0}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <dt className="text-xs font-medium text-slate-500">Alunos usando</dt>
                          <dd className="font-semibold text-slate-800">{alunosComEstePrograma}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalAtribuir(programa.id)}
                        disabled={carregandoAlunos || atribuindo}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Atribuir a aluno
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Exibindo {programasFiltrados.length} de {programas.length} programas
          </p>
        </div>
      </section>

      {/* Modal de atribuição */}
      {programaSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
        >
          <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 id="modal-titulo" className="text-lg font-semibold text-slate-900">
                Atribuir programa #{programaSelecionado}
              </h3>
              <button
                type="button"
                onClick={fecharModal}
                className="rounded-xl p-1 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {carregandoAlunos && (
              <div className="text-center text-sm text-slate-500 py-4" role="status" aria-live="polite">
                Carregando alunos...
              </div>
            )}

            {!carregandoAlunos && !alunos.length && (
              <div className="text-center text-sm text-slate-500 py-4">
                Nenhum aluno cadastrado.
              </div>
            )}

            {!carregandoAlunos && alunos.length > 0 && (
              <form action={handleAtribuir.bind(null, programaSelecionado)} className="space-y-4">
                {estadoAtribuir[programaSelecionado]?.status === "error" && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {estadoAtribuir[programaSelecionado]!.message}
                  </p>
                )}

                <label className="block text-sm font-medium text-slate-700">
                  Aluno
                  <select
                    name="alunoId"
                    required
                    disabled={enviandoAtribuir.has(programaSelecionado!)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Selecione um aluno</option>
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={String(aluno.id)}>
                        {aluno.nome} {aluno.programaAtualId ? "(já tem programa)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={enviandoAtribuir.has(programaSelecionado!)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoAtribuir.has(programaSelecionado!)}
                    aria-busy={enviandoAtribuir.has(programaSelecionado!)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                  >
                    {enviandoAtribuir.has(programaSelecionado!) && (
                      <span
                        aria-hidden="true"
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                    )}
                    <span aria-live="polite">
                      {enviandoAtribuir.has(programaSelecionado!) ? "Atribuindo..." : "Atribuir"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}