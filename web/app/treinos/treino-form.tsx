"use client";

import { useActionState } from "react";
import Link from "next/link";
import { atualizarTreino, type TreinoState } from "@/app/treinos/actions";
import type { Treino } from "@/types/treino";

const estadoInicial: TreinoState = { status: "idle" };

const diasDaSemana = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const campoClassName =
  "mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100";

export default function TreinoForm({ treino }: { treino: Treino }) {
  const [estado, action, salvando] = useActionState(
    atualizarTreino.bind(null, treino.id),
    estadoInicial,
  );

  // Preserva o dia salvo mesmo que o app use um rótulo diferente da lista.
  const dias = diasDaSemana.includes(treino.diaSemana)
    ? diasDaSemana
    : [treino.diaSemana, ...diasDaSemana];

  return (
    <form
      action={action}
      aria-busy={salvando}
      className="space-y-5 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <label className="block text-sm font-semibold text-slate-700">
        Nome
        <input
          name="nome"
          defaultValue={treino.nome}
          minLength={3}
          required
          className={campoClassName}
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Categoria
        <input
          name="categoria"
          defaultValue={treino.categoria ?? ""}
          placeholder="Musculação, Cardio, Funcional..."
          className={campoClassName}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Dia da semana
          <select name="diaSemana" defaultValue={treino.diaSemana} required className={campoClassName}>
            {dias.map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Duração (minutos)
          <input
            name="duracaoMin"
            type="number"
            min={1}
            max={300}
            defaultValue={treino.duracaoMin}
            required
            className={campoClassName}
          />
        </label>
      </div>

      {estado.status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {estado.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/treinos"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
