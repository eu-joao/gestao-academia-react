"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  atualizarAluno,
  cadastrarAluno,
  type CadastroAlunoState,
} from "@/app/actions";
import type { Aluno } from "@/types/aluno";

const estadoInicial: CadastroAlunoState = { status: "idle" };

type ValoresFormulario = {
  nome: string;
  email: string;
  peso: string;
  altura: string;
  nivelExperiencia: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  frequenciaSemanal: string;
};

const valoresIniciais: ValoresFormulario = {
  nome: "",
  email: "",
  peso: "",
  altura: "",
  nivelExperiencia: "INICIANTE",
  frequenciaSemanal: "3",
};

type CampoFormulario = keyof ValoresFormulario;
type ErrosFormulario = Partial<Record<CampoFormulario, string>>;

const campoClassName =
  "mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100";

function converterParaFormulario(aluno?: Aluno): ValoresFormulario {
  if (!aluno) return valoresIniciais;

  return {
    nome: aluno.nome,
    email: aluno.email,
    peso: String(aluno.peso),
    altura: String(aluno.altura),
    nivelExperiencia: aluno.nivelExperiencia,
    frequenciaSemanal: String(aluno.frequenciaSemanal),
  };
}

export default function AlunoForm({ aluno }: { aluno?: Aluno }) {
  const editando = Boolean(aluno);
  const [aberto, setAberto] = useState(editando);
  const [valores, setValores] = useState<ValoresFormulario>(() =>
    converterParaFormulario(aluno),
  );
  const [errosValidacao, setErrosValidacao] = useState<ErrosFormulario>({});
  const [feedbackAcaoVisivel, setFeedbackAcaoVisivel] = useState(true);
  const actionServer = aluno
    ? atualizarAluno.bind(null, aluno.id)
    : cadastrarAluno;

  async function executarAcao(
    estadoAnterior: CadastroAlunoState,
    formData: FormData,
  ) {
    const resultado = await actionServer(estadoAnterior, formData);
    setFeedbackAcaoVisivel(true);
    return resultado;
  }

  const [estado, action, enviando] = useActionState(executarAcao, estadoInicial);

  function atualizar<K extends keyof ValoresFormulario>(campo: K, valor: ValoresFormulario[K]) {
    setFeedbackAcaoVisivel(false);
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    setErrosValidacao((atuais) => {
      if (!atuais[campo]) return atuais;
      const proximos = { ...atuais };
      delete proximos[campo];
      return proximos;
    });
  }

  function classeCampo(campo: CampoFormulario) {
    return `${campoClassName} ${errosValidacao[campo] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`;
  }

  function atributosCampo(campo: CampoFormulario) {
    return {
      "aria-invalid": Boolean(errosValidacao[campo]),
      "aria-describedby": errosValidacao[campo] ? `${campo}-erro` : undefined,
    };
  }

  function validarFormulario(event: FormEvent<HTMLFormElement>) {
    const novosErros: ErrosFormulario = {};
    const email = event.currentTarget.elements.namedItem("email") as HTMLInputElement;

    if (!valores.nome.trim()) novosErros.nome = "Informe o nome do aluno.";
    if (!valores.email.trim()) {
      novosErros.email = "Informe o e-mail do aluno.";
    } else if (email.validity.typeMismatch) {
      novosErros.email = "Informe um endereço de e-mail válido.";
    }
    if (!valores.peso.trim()) {
      novosErros.peso = "Informe o peso do aluno.";
    } else if (!Number.isFinite(Number(valores.peso)) || Number(valores.peso) <= 0) {
      novosErros.peso = "O peso deve ser um número maior que zero.";
    }
    if (!valores.altura.trim()) {
      novosErros.altura = "Informe a altura do aluno.";
    } else if (!Number.isFinite(Number(valores.altura)) || Number(valores.altura) <= 0) {
      novosErros.altura = "A altura deve ser um número maior que zero.";
    }
    if (!( ["INICIANTE", "INTERMEDIARIO", "AVANCADO"] as string[]).includes(valores.nivelExperiencia)) {
      novosErros.nivelExperiencia = "Selecione um nível de experiência válido.";
    }
    if (!["3", "4", "5", "6"].includes(valores.frequenciaSemanal)) {
      novosErros.frequenciaSemanal = "Selecione uma frequência de 3, 4, 5 ou 6 dias.";
    }

    setErrosValidacao(novosErros);
    if (Object.keys(novosErros).length > 0) {
      event.preventDefault();
      const formulario = event.currentTarget;
      const primeiroCampo = Object.keys(novosErros)[0];
      requestAnimationFrame(() => {
        (formulario.elements.namedItem(primeiroCampo) as HTMLElement | null)?.focus();
      });
    } else {
      setFeedbackAcaoVisivel(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-3 sm:items-end">
      {!editando && (
        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          aria-controls="formulario-novo-aluno"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-sky-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:self-auto"
        >
          <span className="text-lg leading-none">{aberto ? "×" : "+"}</span>
          {aberto ? "Fechar formulário" : "Novo aluno"}
        </button>
      )}

      {estado.status === "success" && feedbackAcaoVisivel && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {estado.message}
          {editando && (
            <Link
              href="/"
              className="ml-2 rounded-sm underline underline-offset-2 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              Voltar à listagem atualizada
            </Link>
          )}
        </p>
      )}

      {aberto && (
        <section
          id="formulario-novo-aluno"
          className="w-full rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          aria-labelledby="titulo-formulario-aluno"
        >
          <div className="mb-5">
            <h2 id="titulo-formulario-aluno" className="text-lg font-semibold text-slate-900">
              {editando ? "Editar aluno" : "Cadastrar aluno"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editando
                ? "Atualize os dados do aluno e salve as alterações."
                : "Preencha os dados para adicionar um aluno à academia."}
            </p>
          </div>

          <form
            action={action}
            onSubmit={validarFormulario}
            noValidate
            aria-busy={enviando}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {Object.keys(errosValidacao).length > 0 && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2"
              >
                Revise os campos indicados abaixo antes de continuar.
              </p>
            )}
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Nome
              <input
                id="nome"
                className={classeCampo("nome")}
                {...atributosCampo("nome")}
                name="nome"
                value={valores.nome}
                onChange={(event) => atualizar("nome", event.target.value)}
                autoComplete="name"
                required
                readOnly={editando}
              />
              {editando && (
                <p className="mt-1 text-xs text-slate-500">O nome não pode ser alterado após o cadastro.</p>
              )}
              {errosValidacao.nome && <span id="nome-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.nome}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              E-mail
              <input
                id="email"
                className={classeCampo("email")}
                {...atributosCampo("email")}
                name="email"
                value={valores.email}
                onChange={(event) => atualizar("email", event.target.value)}
                type="email"
                autoComplete="email"
                required
                readOnly={editando}
              />
              {editando && (
                <p className="mt-1 text-xs text-slate-500">O e-mail não pode ser alterado após o cadastro.</p>
              )}
              {errosValidacao.email && <span id="email-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.email}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Peso (kg)
              <input
                id="peso"
                className={classeCampo("peso")}
                {...atributosCampo("peso")}
                name="peso"
                value={valores.peso}
                onChange={(event) => atualizar("peso", event.target.value)}
                type="number"
                min="0.01"
                step="any"
                required
              />
              {errosValidacao.peso && <span id="peso-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.peso}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Altura (m)
              <input
                id="altura"
                className={classeCampo("altura")}
                {...atributosCampo("altura")}
                name="altura"
                value={valores.altura}
                onChange={(event) => atualizar("altura", event.target.value)}
                type="number"
                min="0.01"
                step="any"
                placeholder="Ex.: 1.75"
                required
              />
              {errosValidacao.altura && <span id="altura-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.altura}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Nível de experiência
              <select
                id="nivelExperiencia"
                className={classeCampo("nivelExperiencia")}
                {...atributosCampo("nivelExperiencia")}
                name="nivelExperiencia"
                value={valores.nivelExperiencia}
                onChange={(event) => atualizar("nivelExperiencia", event.target.value as ValoresFormulario["nivelExperiencia"])}
                required
              >
                <option value="INICIANTE">Iniciante</option>
                <option value="INTERMEDIARIO">Intermediário</option>
                <option value="AVANCADO">Avançado</option>
              </select>
              {errosValidacao.nivelExperiencia && <span id="nivelExperiencia-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.nivelExperiencia}</span>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Frequência semanal
              <select
                id="frequenciaSemanal"
                className={classeCampo("frequenciaSemanal")}
                {...atributosCampo("frequenciaSemanal")}
                name="frequenciaSemanal"
                value={valores.frequenciaSemanal}
                onChange={(event) => atualizar("frequenciaSemanal", event.target.value)}
                required
              >
                {[3, 4, 5, 6].map((dias) => (
                  <option key={dias} value={dias}>{dias} dias por semana</option>
                ))}
              </select>
              {errosValidacao.frequenciaSemanal && <span id="frequenciaSemanal-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.frequenciaSemanal}</span>}
            </label>

            {estado.status === "error" && feedbackAcaoVisivel && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
                {estado.message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
              {editando ? (
                (estado.status !== "success" || !feedbackAcaoVisivel) && (
                  <Link
                    href="/"
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  >
                    Voltar à listagem
                  </Link>
                )
              ) : (
                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => setAberto(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={enviando}
                aria-busy={enviando}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
              >
                {enviando && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                <span aria-live="polite">
                  {enviando
                    ? editando ? "Salvando..." : "Cadastrando..."
                    : editando ? "Salvar alterações" : "Cadastrar aluno"}
                </span>
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
