import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Helpers para manipular variáveis de ambiente nos testes
const originalEnv = { ...process.env };

function setEnv(env: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function restoreEnv() {
  process.env = { ...originalEnv };
}

describe("instrumentation", () => {
  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    restoreEnv();
  });

  const VALID_SECRET = "a".repeat(64);
  const VALID_USER = "admin";
  const VALID_PASS = "senhaSegura123";

  function setupValidProdServerEnv() {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123", // Definido em next start também
      NEXT_RUNTIME: "nodejs",
    });
  }

  function setupValidProdBuildEnv() {
    setEnv({
      NEXT_PHASE: "phase-production-build",
      NODE_ENV: "production",
      // Segredos NÃO necessários durante build
      NEXT_RUNTIME: "nodejs",
    });
  }

  function setupDevEnv() {
    setEnv({
      NEXT_PHASE: "phase-development-server",
      NODE_ENV: "development",
    });
  }

  function setupDevEnvNoPhase() {
    setEnv({
      // NEXT_PHASE não definido - simula cenário onde next dev não define a variável
      NODE_ENV: "development",
    });
  }

  it("não lança em desenvolvimento (phase-development-server)", async () => {
    setupDevEnv();
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("não lança em desenvolvimento quando NEXT_PHASE undefined mas NODE_ENV=development", async () => {
    setupDevEnvNoPhase();
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("não lança durante build de produção (phase-production-build)", async () => {
    setupValidProdBuildEnv();
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("não exige segredos durante build de produção", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-build",
      NODE_ENV: "production",
      // Sem SESSION_SECRET, ADMIN_USER, ADMIN_PASS
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("lança erro em produção (phase-production-server) quando SESSION_SECRET ausente", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("SESSION_SECRET");
  });

  it("lança erro em produção quando ADMIN_USER ausente", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("ADMIN_USER");
  });

  it("lança erro em produção quando ADMIN_PASS ausente", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("ADMIN_PASS");
  });

  it("lança erro em produção quando SESSION_SECRET tem tamanho incorreto", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: "a".repeat(63),
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("SESSION_SECRET");
  });

  it("lança erro em produção quando SESSION_SECRET não é hex", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: "g".repeat(64),
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("SESSION_SECRET");
  });

  it("lança erro em produção quando ADMIN_USER é vazio", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: "   ",
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("ADMIN_USER");
  });

  it("lança erro em produção quando ADMIN_PASS é vazio", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: "   ",
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("ADMIN_PASS");
  });

  it("não lança em produção (phase-production-server) com todas as variáveis válidas", async () => {
    setupValidProdServerEnv();
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("executa validação em phase-production-server MESMO com NEXT_BUILD_ID definido", async () => {
    // next start define NEXT_BUILD_ID mas a validação DEVE rodar
    setupValidProdServerEnv(); // Já inclui NEXT_BUILD_ID
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("aceita SESSION_SECRET com letras maiúsculas", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: "A".repeat(64),
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("não valida em Edge Runtime (NEXT_RUNTIME=edge) e loga informação", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "edge",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Edge Runtime detectado")
    );
    consoleLogSpy.mockRestore();
  });

  it("valida em produção Node.js quando NEXT_PHASE ausente (Next.js não define no server)", async () => {
    setEnv({
      // NEXT_PHASE não definido - Next.js não define em next start
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("valida em produção Node.js quando NEXT_PHASE tem valor desconhecido (usa NODE_ENV)", async () => {
    setEnv({
      NEXT_PHASE: "unknown-phase",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("valida em produção Node.js quando NEXT_PHASE é phase-test (usa NODE_ENV)", async () => {
    setEnv({
      NEXT_PHASE: "phase-test",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "nodejs",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
  });

  it("FALHA em phase-production-server com NEXT_RUNTIME=custom", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "custom",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("NEXT_RUNTIME=\"custom\" não suportado");
  });

  it("FALHA em phase-production-server com NEXT_RUNTIME=unknown", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "unknown-runtime",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("NEXT_RUNTIME=\"unknown-runtime\" não suportado");
  });

  it("FALHA em phase-production-server com NEXT_RUNTIME=vazio string", async () => {
    setEnv({
      NEXT_PHASE: "phase-production-server",
      NODE_ENV: "production",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_BUILD_ID: "build-123",
      NEXT_RUNTIME: "",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow("NEXT_RUNTIME=\"\" não suportado");
  });

  it("não valida em runtime não-Node desconhecido em fase não-reconhecida (fail-safe com warning)", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // NODE_ENV não é production nem development - cenário atípico
    setEnv({
      NEXT_PHASE: "unknown-phase",
      NODE_ENV: "test",
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
      NEXT_RUNTIME: "custom-runtime",
    });
    const { register } = await import("@/instrumentation");
    await expect(register()).resolves.not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Contexto não reconhecido")
    );
    consoleWarnSpy.mockRestore();
  });
});