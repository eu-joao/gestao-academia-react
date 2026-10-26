"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { excluirAluno, type CadastroAlunoState } from "@/app/actions";

const estadoInicial: CadastroAlunoState = { status: "idle" };

export default function ExcluirAlunoButton({
  alunoId,
  alunoNome,
}: {
  alunoId: number;
  alunoNome: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const actionServer = excluirAluno.bind(null, alunoId);
  const [estado, action, excluindo] = useActionState(actionServer, estadoInicial);
  const botaoExcluirRef = useRef<HTMLButtonElement>(null);
  const botaoCancelarRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirmando) return;

    if (excluindo) {
      dialogRef.current?.focus();
    } else {
      botaoCancelarRef.current?.focus();
    }

    function lidarComTeclado(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (excluindo) return;
        event.preventDefault();
        setConfirmando(false);
        botaoExcluirRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const botoes = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      );
      if (!botoes?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const primeiro = botoes[0];
      const ultimo = botoes[botoes.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      } else if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", lidarComTeclado);
    return () => document.removeEventListener("keydown", lidarComTeclado);
  }, [confirmando, excluindo]);

  function cancelar() {
    setConfirmando(false);
    botaoExcluirRef.current?.focus();
  }

  return (
    <>
      <button
        ref={botaoExcluirRef}
        type="button"
        onClick={() => setConfirmando(true)}
        disabled={excluindo || confirmando}
        aria-haspopup="dialog"
        aria-expanded={confirmando}
        aria-controls={`confirmar-exclusao-${alunoId}`}
        className="min-h-10 rounded-xl px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Excluir
      </button>

      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]">
          <div
            ref={dialogRef}
            id={`confirmar-exclusao-${alunoId}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`titulo-exclusao-${alunoId}`}
            aria-describedby={`descricao-exclusao-${alunoId}`}
            tabIndex={-1}
            className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <h2
              id={`titulo-exclusao-${alunoId}`}
              className="text-lg font-bold text-slate-900 sm:text-xl"
            >
              Excluir aluno?
            </h2>
            <p className="mt-3 break-words text-sm font-semibold text-slate-900">
              {alunoNome}
            </p>
            <p
              id={`descricao-exclusao-${alunoId}`}
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Esta ação não pode ser desfeita. Confirme para excluir este aluno.
            </p>

            {estado.status === "error" && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {estado.message}
              </p>
            )}

            <form
              action={action}
              className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
              aria-busy={excluindo}
            >
              <button
                ref={botaoCancelarRef}
                type="button"
                disabled={excluindo}
                onClick={cancelar}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={excluindo}
                aria-busy={excluindo}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
              >
                {excluindo && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                <span aria-live="polite">
                  {excluindo ? "Excluindo..." : "Excluir aluno"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
