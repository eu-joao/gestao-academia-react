"use client";

import { excluirTreino } from "@/app/treinos/actions";

export default function ExcluirTreinoButton({
  treinoId,
  treinoNome,
}: {
  treinoId: string;
  treinoNome: string;
}) {
  return (
    <form
      action={excluirTreino.bind(null, treinoId)}
      onSubmit={(event) => {
        if (!window.confirm(`Excluir o treino "${treinoNome}"? Esta ação não pode ser desfeita.`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="min-h-10 rounded-xl px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        Excluir
      </button>
    </form>
  );
}
