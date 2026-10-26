import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AlunoForm from "@/app/aluno-form";
import { mensagemErroApi } from "@/lib/api-error";
import type { Aluno } from "@/types/aluno";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function CarregandoEdicao() {
  return (
    <main className="flex flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="mx-auto w-full max-w-4xl rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
      >
        Carregando dados do aluno...
      </div>
    </main>
  );
}

function FalhaNaEdicao({ mensagem }: { mensagem: string }) {
  return (
    <main className="flex flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div
        role="alert"
        className="mx-auto w-full max-w-3xl rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-extrabold text-slate-900">
          Não foi possível carregar o aluno
        </h1>
        <p className="mt-2 leading-6 text-slate-700">{mensagem}</p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-lg font-bold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Voltar à listagem
        </Link>
      </div>
    </main>
  );
}

export default function EditarAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<CarregandoEdicao />}>
      <EditarAluno params={params} />
    </Suspense>
  );
}

async function EditarAluno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(alunoId) || alunoId < 1) {
    notFound();
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/alunos/${alunoId}`, {
      cache: "no-store",
    });
  } catch {
    return (
      <FalhaNaEdicao mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e tente novamente." />
    );
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    return (
      <FalhaNaEdicao
        mensagem={await mensagemErroApi(
          response,
          "A API retornou um erro ao buscar este cadastro.",
        )}
      />
    );
  }

  let aluno: Aluno;

  try {
    aluno = await response.json();
  } catch (error) {
    const mensagem = error instanceof TypeError
      ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e tente novamente."
      : "A API retornou dados inválidos para este aluno.";
    return <FalhaNaEdicao mensagem={mensagem} />;
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 border-b border-slate-200 pb-6">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
            Gestão de academia
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Editar aluno
          </h1>
          <p className="mt-2 text-slate-600">Atualize os dados de {aluno.nome}.</p>
        </header>

        <AlunoForm aluno={aluno} />
      </div>
    </main>
  );
}
