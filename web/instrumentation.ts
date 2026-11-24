// Validação de configuração de produção no startup do Next.js.
// Este arquivo é executado uma vez ao iniciar o servidor (não durante o build).
// Usa NEXT_PHASE e NODE_ENV para distinguir build de inicialização do servidor.

import { validateProductionEnv } from "./lib/env-validation";

export async function register() {
  // Next.js define NEXT_PHASE indicando a fase atual:
  // - "phase-development-server": next dev
  // - "phase-production-build": next build
  // - "phase-production-server": next start (produção) — NÃO definido automaticamente no server
  // - "phase-test": next test (não usado aqui)
  const phase = process.env.NEXT_PHASE;
  const runtime = process.env.NEXT_RUNTIME;
  const nodeEnv = process.env.NODE_ENV;

  // Desenvolvimento: nunca valida segredos de produção
  // Verifica NODE_ENV primeiro pois NEXT_PHASE pode ser undefined em alguns cenários de dev
  if (nodeEnv === "development" || phase === "phase-development-server") {
    return;
  }

  // Build de produção: segredos não precisam estar disponíveis durante o build
  if (phase === "phase-production-build") {
    return;
  }

  // A partir daqui, estamos em contexto de produção (não desenvolvimento, não build)
  // NODE_ENV=production indica servidor de produção (next start), mesmo que NEXT_PHASE não esteja definido
  const isProduction = nodeEnv === "production";

  // Verifica runtime: o servidor de autenticação roda em Node.js
  // String vazia é tratada como runtime inválido (não Node.js)
  const isNodeRuntime = runtime === undefined || runtime === "nodejs";

  // Servidor de produção Node.js (next start) - runtime undefined ou "nodejs"
  // Aceita tanto phase-production-server explícito quanto NODE_ENV=production (Next.js não define NEXT_PHASE no server)
  if (isProduction && isNodeRuntime) {
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
  if (isProduction && runtime === "edge") {
    console.log("[instrumentation] Edge Runtime detectado — validação de segredos Node.js ignorada.");
    return;
  }

  // Produção com runtime desconhecido ou vazio (não nodejs, não edge, não ausente)
  // Falha explícita para evitar fail-open
  if (isProduction && runtime !== undefined && runtime !== "nodejs" && runtime !== "edge") {
    const errorMessage = `[instrumentation] Falha na validação de produção: NEXT_RUNTIME="${runtime}" não suportado. Em produção, use "nodejs" (padrão) ou "edge".`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Caso residual: runtime não-Node desconhecido em fase não-reconhecida (não desenvolvimento, não build, não produção)
  // Fail-safe: não bloqueia, mas alerta (cenário não esperado)
  console.warn(`[instrumentation] Contexto não reconhecido: NEXT_PHASE="${phase}", NEXT_RUNTIME="${runtime}", NODE_ENV="${nodeEnv}". Validação ignorada.`);
}