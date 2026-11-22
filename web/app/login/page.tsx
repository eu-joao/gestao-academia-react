import LoginForm from "@/app/login/login-form";

export const metadata = {
  title: "Entrar | Gestão Academia",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
          Portal do personal
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          Entrar
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Acesso restrito ao administrador da academia.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
