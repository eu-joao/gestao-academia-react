import Link from "next/link";

export default function AlunoNaoEncontrado() {
  return (
    <main className="flex flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-3xl rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
          Gestão de academia
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Aluno não encontrado
        </h1>
        <p className="mt-2 leading-6 text-slate-600">
          O aluno solicitado não existe ou não está mais disponível.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          Voltar à listagem de alunos
        </Link>
      </div>
    </main>
  );
}
