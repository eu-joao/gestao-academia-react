import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TreinoForm from "@/app/treinos/treino-form";
import { mensagemErroApi } from "@/lib/api-error";
import type { Treino } from "@/types/treino";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Falha({ mensagem }: { mensagem: string }) {
  return (
    <main className="flex flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div
        role="alert"
        className="mx-auto w-full max-w-3xl rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-extrabold text-slate-900">
          Não foi possível carregar o treino
        </h1>
        <p className="mt-2 leading-6 text-slate-700">{mensagem}</p>
        <Link
          href="/treinos"
          className="mt-5 inline-flex rounded-lg font-bold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Voltar à listagem
        </Link>
      </div>
    </main>
  );
}

export default function EditarTreinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <div
            role="status"
            aria-busy="true"
            className="mx-auto w-full max-w-3xl rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
          >
            Carregando dados do treino...
          </div>
        </main>
      }
    >
      <EditarTreino params={params} />
    </Suspense>
  );
}

async function EditarTreino({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID.test(id)) notFound();

  let response: Response;

  try {
    response = await fetch(`${API_URL}/treinos/${id}`, { cache: "no-store" });
  } catch {
    return (
      <Falha mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e tente novamente." />
    );
  }

  if (response.status === 404) notFound();

  if (!response.ok) {
    return (
      <Falha
        mensagem={await mensagemErroApi(
          response,
          "A API retornou um erro ao buscar este treino.",
        )}
      />
    );
  }

  let treino: Treino;

  try {
    treino = await response.json();
  } catch {
    return <Falha mensagem="A API retornou dados inválidos para este treino." />;
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 border-b border-slate-200 pb-6">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
            Gestão de academia
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Editar treino
          </h1>
          <p className="mt-2 text-slate-600">Atualize os dados de {treino.nome}.</p>
        </header>

        <TreinoForm treino={treino} />
      </div>
    </main>
  );
}
