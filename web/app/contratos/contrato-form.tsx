"use client";

import { useActionState, useState, type FormEvent, useEffect } from "react";
import { criarContrato, listarAlunosParaContrato, listarPlanos, type ContratoState, type AlunoParaContrato, type PlanoInfo } from "@/app/actions";

const estadoInicial: ContratoState = { status: "idle" };

type ValoresFormulario = {
  alunoId: string;
  plano: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
  dataInicio: string;
};

const valoresIniciais: ValoresFormulario = {
  alunoId: "",
  plano: "MENSAL",
  dataInicio: new Date().toISOString().split("T")[0],
};

type CampoFormulario = keyof ValoresFormulario;
type ErrosFormulario = Partial<Record<CampoFormulario, string>>;

const campoClassName =
  "mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100";

export default function ContratoForm() {
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciais);
  const [errosValidacao, setErrosValidacao] = useState<ErrosFormulario>({});
  const [feedbackAcaoVisivel, setFeedbackAcaoVisivel] = useState(true);
  const [alunos, setAlunos] = useState<AlunoParaContrato[]>([]);
  const [planos, setPlanos] = useState<PlanoInfo[]>([]);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);

  const [estado, action, enviando] = useActionState(
    async (estadoAnterior: ContratoState, formData: FormData) => {
      const resultado = await criarContrato(estadoAnterior, formData);
      setFeedbackAcaoVisivel(true);
      return resultado;
    },
    estadoInicial,
  );

  useEffect(() => {
    async function carregar() {
      setCarregandoOpcoes(true);
      const [alunosData, planosData] = await Promise.all([
        listarAlunosParaContrato(),
        listarPlanos(),
      ]);
      setAlunos(alunosData);
      setPlanos(planosData);
      setCarregandoOpcoes(false);
    }
    carregar();
  }, []);

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

    if (!valores.alunoId) novosErros.alunoId = "Selecione um aluno.";
    if (!valores.plano) novosErros.plano = "Selecione um plano.";
    if (!valores.dataInicio) novosErros.dataInicio = "Informe a data de início.";

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

  function formatarPlano(tipo: PlanoInfo["tipo"]) {
    const planos = {
      MENSAL: "Mensal (1 mês)",
      TRIMESTRAL: "Trimestral (3 meses)",
      SEMESTRAL: "Semestral (6 meses)",
    };
    return planos[tipo];
  }

  return (
    <section
      className="w-full rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="titulo-formulario-contrato"
    >
      <div className="mb-5">
        <h2 id="titulo-formulario-contrato" className="text-lg font-semibold text-slate-900">
          Novo contrato
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Selecione o aluno, o plano e a data de início para criar um novo contrato.
        </p>
      </div>

      {carregandoOpcoes && (
        <div className="mb-5 text-center text-sm text-slate-500" role="status" aria-live="polite">
          Carregando opções...
        </div>
      )}

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
          Aluno
          <select
            id="alunoId"
            className={classeCampo("alunoId")}
            {...atributosCampo("alunoId")}
            name="alunoId"
            value={valores.alunoId}
            onChange={(event) => atualizar("alunoId", event.target.value)}
            disabled={carregandoOpcoes || enviando}
            required
          >
            <option value="">Selecione um aluno</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={String(aluno.id)}>
                {aluno.nome}
              </option>
            ))}
          </select>
          {errosValidacao.alunoId && <span id="alunoId-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.alunoId}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Plano
          <select
            id="plano"
            className={classeCampo("plano")}
            {...atributosCampo("plano")}
            name="plano"
            value={valores.plano}
            onChange={(event) => atualizar("plano", event.target.value as ValoresFormulario["plano"])}
            disabled={carregandoOpcoes || enviando}
            required
          >
            <option value="">Selecione um plano</option>
            {planos.map((plano) => (
              <option key={plano.tipo} value={plano.tipo}>
                {formatarPlano(plano.tipo)} — R$ {plano.valorMensal.toFixed(2)}/mês
              </option>
            ))}
          </select>
          {errosValidacao.plano && <span id="plano-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.plano}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Data de início
          <input
            id="dataInicio"
            className={classeCampo("dataInicio")}
            {...atributosCampo("dataInicio")}
            name="dataInicio"
            value={valores.dataInicio}
            onChange={(event) => atualizar("dataInicio", event.target.value)}
            type="date"
            disabled={enviando}
            required
          />
          {errosValidacao.dataInicio && <span id="dataInicio-erro" className="mt-1 block text-sm text-red-700">{errosValidacao.dataInicio}</span>}
        </label>

        {estado.status === "error" && feedbackAcaoVisivel && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
            {estado.message}
          </p>
        )}

        {estado.status === "success" && feedbackAcaoVisivel && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 sm:col-span-2"
          >
            {estado.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={enviando}
            onClick={() => {
              setValores(valoresIniciais);
              setErrosValidacao({});
              setFeedbackAcaoVisivel(true);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={enviando || carregandoOpcoes}
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
              {enviando ? "Cadastrando..." : "Cadastrar contrato"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}