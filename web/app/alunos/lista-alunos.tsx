"use client";

import { useState } from "react";
import Link from "next/link";
import ExcluirAlunoButton from "@/app/alunos/excluir-aluno-button";
import type { Aluno } from "@/types/aluno";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export default function ListaAlunos({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");
  const consulta = normalizarTexto(busca.trim());
  const cpfConsulta = busca.replace(/\D/g, "");
  const alunosFiltrados = consulta
    ? alunos.filter((aluno) =>
        normalizarTexto(aluno.nome).includes(consulta) ||
        normalizarTexto(aluno.email).includes(consulta) ||
        (cpfConsulta.length > 0 &&
          aluno.cpf.replace(/\D/g, "").includes(cpfConsulta)),
      )
    : alunos;

  const formatarNivel = (nivel: Aluno["nivelExperiencia"]) => {
    const niveis = {
      INICIANTE: "Iniciante",
      INTERMEDIARIO: "Intermediário",
      AVANCADO: "Avançado",
    };

    return niveis[nivel];
  };

  const alunosAtivos = alunos.filter((aluno) => aluno.status === "ATIVO").length;

  return (
    <>
      <section aria-label="Resumo de alunos" className="mb-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Total de alunos</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {alunos.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">Alunos cadastrados no sistema</p>
          </article>

          <article className="rounded-[20px] border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-slate-500">Alunos ativos</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {alunosAtivos}
            </p>
            <p className="mt-1 text-sm text-slate-500">Com cadastro ativo</p>
          </article>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Os cartões mostram todos os alunos; a busca filtra apenas a lista.
        </p>
      </section>

      <section
        aria-labelledby="titulo-lista-alunos"
        className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="titulo-lista-alunos" className="text-xl font-bold text-slate-900">
                Lista de alunos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulte e gerencie os cadastros da academia.
              </p>
            </div>
            <label className="w-full text-sm font-semibold text-slate-700 sm:max-w-sm">
              Buscar alunos
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, CPF ou e-mail..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500" role="status" aria-live="polite">
            {consulta
              ? `${alunosFiltrados.length} de ${alunos.length} ${alunos.length === 1 ? "aluno encontrado" : "alunos encontrados"}`
              : `${alunos.length} ${alunos.length === 1 ? "aluno cadastrado" : "alunos cadastrados"}`}
          </p>
        </div>

        {!alunos.length ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sky-50 text-xl font-bold text-sky-700" aria-hidden="true">
              +
            </div>
            <p className="mt-4 font-bold text-slate-900">Nenhum aluno cadastrado</p>
            <p className="mt-1 text-sm text-slate-500">
              Use “Novo aluno” para adicionar o primeiro cadastro.
            </p>
          </div>
        ) : !alunosFiltrados.length ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-slate-900">
              Nenhum aluno encontrado para “{busca.trim()}”.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Confira o nome, CPF ou e-mail e tente novamente.
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
          <ul className="space-y-3 p-4 sm:p-5" aria-label="Alunos">
            {alunosFiltrados.map((aluno) => (
              <li
                key={aluno.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:shadow-sm sm:p-5"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-base font-extrabold text-sky-800">
                      {aluno.nome.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{aluno.nome}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        Aluno #{aluno.id}
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-3 text-sm sm:grid-cols-3 md:border-0 md:py-0">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Experiência</dt>
                      <dd className="mt-1 font-semibold text-slate-800">
                        {formatarNivel(aluno.nivelExperiencia)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Frequência</dt>
                      <dd className="mt-1 font-semibold text-slate-800">
                        {aluno.frequenciaSemanal} dias/semana
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Status</dt>
                      <dd className="mt-1">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${aluno.status === "ATIVO" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                        >
                          <span
                            className={`size-2 rounded-full ${aluno.status === "ATIVO" ? "bg-emerald-500" : "bg-red-500"}`}
                            aria-hidden="true"
                          />
                          {aluno.status === "ATIVO" ? "Ativo" : "Inativo"}
                        </span>
                      </dd>
                    </div>
                  </dl>

                  <div className="flex gap-2 md:justify-end">
                    <Link
                      href={`/alunos/${aluno.id}/editar`}
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 md:flex-none"
                    >
                      Editar
                    </Link>
                    <ExcluirAlunoButton
                      alunoId={aluno.id}
                      alunoNome={aluno.nome}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="text-xs font-medium text-slate-500">
            Exibindo {alunosFiltrados.length} de {alunos.length} alunos
          </p>
        </div>
      </section>
    </>
  );
}
