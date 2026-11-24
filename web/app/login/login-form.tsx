"use client";

import { useActionState } from "react";
import { entrar, type LoginState } from "@/app/login/actions";

const estadoInicial: LoginState = { status: "idle" };

const campoClassName =
  "mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100";

export default function LoginForm() {
  const [estado, action, entrando] = useActionState(entrar, estadoInicial);

  return (
    <form action={action} className="space-y-4" aria-busy={entrando}>
      <label className="block text-sm font-semibold text-slate-700">
        Usuário
        <input
          name="usuario"
          type="text"
          autoComplete="username"
          required
          className={campoClassName}
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={campoClassName}
        />
      </label>

      {estado.status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {estado.message}
        </p>
      )}

      <button
        type="submit"
        disabled={entrando}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75"
      >
        {entrando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
