// Validação de configuração de produção no startup do Next.js.
// Este arquivo é executado uma vez ao iniciar o servidor (não durante o build).
// Usa NEXT_PHASE para distinguir build de inicialização do servidor.

import { validateProductionEnv } from "./lib/env-validation";

export async function register() {
  // Next.js define NEXT_PHASE indicando a fase atual:
  // - "phase-development-server": next dev
  // - "phase-production-build": next build
  // - "phase-production-server": next start (produção)
  // - "phase-test": next test (não usado aqui)
  const phase = process.env.NEXT_PHASE;
  const runtime = process.env.NEXT_RUNTIME;

  // Desenvolvimento: nunca valida segredos de produção
  if (phase === "phase-development-server") {
    return;
  }

  // Build de produção: segredos não precisam estar disponíveis durante o build
  if (phase === "phase-production-build") {
    return;
  }

  // A partir daqui, estamos em contexto de produção (não desenvolvimento, não build)
  // Verifica runtime: o servidor de autenticação roda em Node.js
  // String vazia é tratada como runtime inválido (não Node.js)
  const isNodeRuntime = runtime === undefined || runtime === "nodejs";

  // Servidor de produção Node.js (next start) - runtime undefined ou "nodejs"
  if (phase === "phase-production-server" && isNodeRuntime) {
    const result = validateProductionEnv();

    if (!result.valid) {
      const errorMessage = `[instrumentation] Configuração de produção inválida:\n${result.errors.join("\n")}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log("[instrumentation] Configuração de produção validada com sucesso.");
    return;
  }

  // Fase de produção conhecida mas Edge Runtime
  // Edge Runtime não executa validação de segredos do servidor Node.js
  // Exceção documentada: apenas para edge, não para outros runtimes
  if (phase === "phase-production-server" && runtime === "edge") {
    console.log("[instrumentation] Edge Runtime detectado — validação de segredos Node.js ignorada.");
    return;
  }

  // phase-production-server com runtime desconhecido ou vazio (não nodejs, não edge, não ausente)
  // Falha explícita para evitar fail-open
  if (phase === "phase-production-server" && runtime !== undefined && runtime !== "nodejs" && runtime !== "edge") {
    const errorMessage = `[instrumentation] Falha na validação de produção: NEXT_RUNTIME="${runtime}" não suportado. Em produção, use "nodejs" (padrão) ou "edge".`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Fase ausente ou desconhecida em produção Node.js
  // Não usamos fail-open: falha explícita para evitar servidor mal configurado
  if (isNodeRuntime) {
    const errorMessage = `[instrumentation] Falha na validação de produção: NEXT_PHASE ausente ou inválido ("${phase}"). Em produção Node.js, a fase deve ser explicitamente "phase-production-server".`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Caso residual: runtime não-Node desconhecido em fase não-reconhecida
  // Fail-safe: não bloqueia, mas alerta (cenário não esperado)
  console.warn(`[instrumentation] Contexto não reconhecido: NEXT_PHASE="${phase}", NEXT_RUNTIME="${runtime}". Validação ignorada.`);
}