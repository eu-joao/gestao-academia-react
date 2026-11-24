import { Suspense } from "react";
import ListaCobrancas from "@/app/cobrancas/lista-cobrancas";
import { mensagemErroApi } from "@/lib/api-error";
import type { CobrancaComContrato } from "@/app/actions";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

function FalhaAoCarregarCobrancas({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Não foi possível carregar as cobranças
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{mensagem}</p>
    </div>
  );
}

async function CobrancasLista() {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/cobrancas`, {
      cache: "no-store",
    });
  } catch {
    return (
      <FalhaAoCarregarCobrancas
        mensagem="Não foi possível conectar ao servidor da API. Verifique se o backend Spring Boot está em execução e atualize a página."
      />
    );
  }

  if (!res.ok) {
    return (
      <FalhaAoCarregarCobrancas
        mensagem={await mensagemErroApi(
          res,
          "A API não conseguiu carregar as cobranças. Tente novamente mais tarde.",
        )}
      />
    );
  }

  let cobrancas: CobrancaComContrato[] = [];
  let erroResposta: string | null = null;

  try {
    const dados: unknown = await res.json();
    if (!Array.isArray(dados)) {
      erroResposta = "A API retornou uma resposta inválida ao carregar as cobranças.";
    } else {
      const cobrancasBasicas = dados as Array<{
        id: number;
        contratoId: number;
        numeroParcela: number;
        dataVencimento: string;
        valor: number;
        status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
        dataPagamento: string | null;
      }>;

      // Buscar contratos para obter alunoId
      let contratosRes: Response;
      try {
        contratosRes = await fetch(`${API_URL}/contratos`, { cache: "no-store" });
      } catch {
        contratosRes = { ok: false } as Response;
      }

      const contratos: Array<{ id: number; alunoId: number }> = contratosRes.ok
        ? await contratosRes.json()
        : [];

      const contratoAlunoMap = new Map(contratos.map((c) => [c.id, c.alunoId]));

      // Buscar alunos para obter nomes
      let alunosRes: Response;
      try {
        alunosRes = await fetch(`${API_URL}/alunos`, { cache: "no-store" });
      } catch {
        alunosRes = { ok: false } as Response;
      }

      const alunos: Array<{ id: number; nome: string }> = alunosRes.ok
        ? await alunosRes.json()
        : [];

      const alunosMap = new Map(alunos.map((a) => [a.id, a.nome]));

      cobrancas = cobrancasBasicas.map((c) => {
        const alunoId = contratoAlunoMap.get(c.contratoId) ?? 0;
        return {
          ...c,
          alunoId,
          alunoNome: alunosMap.get(alunoId) ?? `Aluno #${alunoId}`,
        };
      });
    }
  } catch (error) {
    erroResposta = error instanceof TypeError
      ? "A conexão com o servidor foi interrompida durante o carregamento. Verifique a API e atualize a página."
      : "A API retornou uma resposta inválida ao carregar as cobranças.";
  }

  if (erroResposta) return <FalhaAoCarregarCobrancas mensagem={erroResposta} />;

  return <ListaCobrancas cobrancas={cobrancas} />;
}

export default function CobrancasPage() {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
              Gestão de academia
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cobranças
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Acompanhe vencimentos, pagamentos e situação financeira dos contratos.
            </p>
          </div>
        </header>

        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="rounded-[20px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
            >
              Carregando cobranças...
            </div>
          }
        >
          <CobrancasLista />
        </Suspense>
      </div>
    </main>
  );
}