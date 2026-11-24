import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { COOKIE_SESSAO, createSessionCookie } from "@/lib/session";
import { base64UrlEncode } from "@/lib/crypto-utils";
import { createHmac } from "node:crypto";

// Mock do server-only (usado por require-auth.ts)
vi.mock("server-only", () => ({}));

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

const VALID_SECRET = "a".repeat(64);
const VALID_USER = "admin";
const VALID_PASS = "senhaSegura123";

function setupValidEnv() {
  setEnv({
    SESSION_SECRET: VALID_SECRET,
    ADMIN_USER: VALID_USER,
    ADMIN_PASS: VALID_PASS,
    NODE_ENV: "production",
    API_URL: "http://localhost:8080",
  });
}

// Helper para criar cookie válido
function createValidCookie(): string {
  return createSessionCookie();
}

// Helper para criar cookie expirado
function createExpiredCookie(): string {
  const now = Math.floor(Date.now() / 1000);
  const past = now - 100;
  const payload = { iat: past, exp: past + 10 };
  const payloadBytes = Buffer.from(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  const secret = Buffer.from(VALID_SECRET, "hex");
  const hmac = createHmac("sha256", secret);
  hmac.update(payloadBytes);
  const signature = base64UrlEncode(hmac.digest());

  return `${payloadB64}.${signature}`;
}

// Helper para criar cookie com assinatura adulterada
function createTamperedCookie(): string {
  const cookie = createValidCookie();
  const [payload] = cookie.split(".");
  return `${payload}.assinaturaInvalida`;
}

// Helper para criar cookie malformado
function createMalformedCookie(): string {
  return "cookie-malformado";
}

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock do redirect do Next.js - lança erro especial
const REDIRECT_ERROR = "NEXT_REDIRECT";
interface RedirectError extends Error {
  digest: string;
  url: string;
}
function createRedirectError(url: string): RedirectError {
  const error = new Error(REDIRECT_ERROR) as RedirectError;
  error.digest = REDIRECT_ERROR;
  error.url = url;
  return error;
}

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw createRedirectError(url);
  }),
  revalidatePath: vi.fn(),
}));

// Mock de next/headers
const mockCookiesGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockCookiesGet,
    })
  ),
}));

// Mock de revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Server Actions - autenticação", () => {
  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
    vi.clearAllMocks();
    setupValidEnv();
    mockFetch.mockReset();
  });

  afterEach(() => {
    restoreEnv();
  });

  // Helper para configurar cookie no mock
  function setMockCookie(value: string | undefined) {
    mockCookiesGet.mockImplementation((name: string) => {
      if (name === COOKIE_SESSAO) {
        return value ? { name: COOKIE_SESSAO, value } : undefined;
      }
      return undefined;
    });
  }

  // Helper para verificar se redirect foi para /login
  function expectRedirectToLogin(promise: Promise<unknown>) {
    return expect(promise).rejects.toMatchObject({
      digest: REDIRECT_ERROR,
      url: expect.stringContaining("/login"),
    });
  }

  describe("cadastrarAluno", () => {
    it("bloqueia execução sem sessão (cookie undefined)", async () => {
      setMockCookie(undefined);

      const { cadastrarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(cadastrarAluno({ status: "idle" }, formData));

      // Verifica que fetch NÃO foi chamado
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com cookie malformado", async () => {
      setMockCookie(createMalformedCookie());

      const { cadastrarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(cadastrarAluno({ status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com assinatura adulterada", async () => {
      setMockCookie(createTamperedCookie());

      const { cadastrarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(cadastrarAluno({ status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com sessão expirada", async () => {
      setMockCookie(createExpiredCookie());

      const { cadastrarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(cadastrarAluno({ status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("permite execução com sessão válida - chega à lógica de negócio", async () => {
      setMockCookie(createValidCookie());

      // Mock de resposta de sucesso da API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const { cadastrarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      // Retorna estado de sucesso (não faz redirect)
      const result = await cadastrarAluno({ status: "idle" }, formData);

      expect(result).toEqual({
        status: "success",
        message: "Aluno cadastrado com sucesso.",
      });

      // Verifica que fetch FOI chamado
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/alunos"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      );
    });
  });

  describe("atualizarAluno", () => {
    it("bloqueia execução sem sessão", async () => {
      setMockCookie(undefined);

      const { atualizarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste Atualizado");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(atualizarAluno(1, { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com cookie malformado", async () => {
      setMockCookie(createMalformedCookie());

      const { atualizarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste Atualizado");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(atualizarAluno(1, { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com assinatura adulterada", async () => {
      setMockCookie(createTamperedCookie());

      const { atualizarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste Atualizado");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(atualizarAluno(1, { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com sessão expirada", async () => {
      setMockCookie(createExpiredCookie());

      const { atualizarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste Atualizado");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      await expectRedirectToLogin(atualizarAluno(1, { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("permite execução com sessão válida", async () => {
      setMockCookie(createValidCookie());

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const { atualizarAluno } = await import("@/app/actions");
      const formData = new FormData();
      formData.append("nome", "Teste Atualizado");
      formData.append("cpf", "12345678901");
      formData.append("telefone", "11999999999");
      formData.append("email", "teste@teste.com");
      formData.append("dataNascimento", "1990-01-01");
      formData.append("peso", "70");
      formData.append("altura", "1.75");
      formData.append("nivelExperiencia", "INICIANTE");
      formData.append("frequenciaSemanal", "3");
      formData.append("status", "ATIVO");

      const result = await atualizarAluno(1, { status: "idle" }, formData);

      expect(result).toEqual({
        status: "success",
        message: "Aluno atualizado com sucesso.",
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/alunos/1"),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  describe("atualizarTreino", () => {
    it("bloqueia execução sem sessão", async () => {
      setMockCookie(undefined);

      const { atualizarTreino } = await import("@/app/treinos/actions");
      const formData = new FormData();
      formData.append("nome", "Treino Atualizado");
      formData.append("categoria", "FORCA");
      formData.append("diaSemana", "SEGUNDA");
      formData.append("duracaoMin", "60");

      await expectRedirectToLogin(atualizarTreino("1", { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com cookie malformado", async () => {
      setMockCookie(createMalformedCookie());

      const { atualizarTreino } = await import("@/app/treinos/actions");
      const formData = new FormData();
      formData.append("nome", "Treino Atualizado");
      formData.append("categoria", "FORCA");
      formData.append("diaSemana", "SEGUNDA");
      formData.append("duracaoMin", "60");

      await expectRedirectToLogin(atualizarTreino("1", { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com assinatura adulterada", async () => {
      setMockCookie(createTamperedCookie());

      const { atualizarTreino } = await import("@/app/treinos/actions");
      const formData = new FormData();
      formData.append("nome", "Treino Atualizado");
      formData.append("categoria", "FORCA");
      formData.append("diaSemana", "SEGUNDA");
      formData.append("duracaoMin", "60");

      await expectRedirectToLogin(atualizarTreino("1", { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com sessão expirada", async () => {
      setMockCookie(createExpiredCookie());

      const { atualizarTreino } = await import("@/app/treinos/actions");
      const formData = new FormData();
      formData.append("nome", "Treino Atualizado");
      formData.append("categoria", "FORCA");
      formData.append("diaSemana", "SEGUNDA");
      formData.append("duracaoMin", "60");

      await expectRedirectToLogin(atualizarTreino("1", { status: "idle" }, formData));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("permite execução com sessão válida", async () => {
      setMockCookie(createValidCookie());

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const { atualizarTreino } = await import("@/app/treinos/actions");
      const formData = new FormData();
      formData.append("nome", "Treino Atualizado");
      formData.append("categoria", "FORCA");
      formData.append("diaSemana", "SEGUNDA");
      formData.append("duracaoMin", "60");

      await expect(atualizarTreino("1", { status: "idle" }, formData)).rejects.toMatchObject({
        digest: REDIRECT_ERROR,
        url: expect.stringContaining("/treinos?treino=atualizado"),
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/treinos/1"),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  describe("excluirTreino", () => {
    it("bloqueia execução sem sessão", async () => {
      setMockCookie(undefined);

      const { excluirTreino } = await import("@/app/treinos/actions");

      await expectRedirectToLogin(excluirTreino("1"));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com cookie malformado", async () => {
      setMockCookie(createMalformedCookie());

      const { excluirTreino } = await import("@/app/treinos/actions");

      await expectRedirectToLogin(excluirTreino("1"));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com assinatura adulterada", async () => {
      setMockCookie(createTamperedCookie());

      const { excluirTreino } = await import("@/app/treinos/actions");

      await expectRedirectToLogin(excluirTreino("1"));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("bloqueia execução com sessão expirada", async () => {
      setMockCookie(createExpiredCookie());

      const { excluirTreino } = await import("@/app/treinos/actions");

      await expectRedirectToLogin(excluirTreino("1"));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("permite execução com sessão válida", async () => {
      setMockCookie(createValidCookie());

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const { excluirTreino } = await import("@/app/treinos/actions");

      await expect(excluirTreino("1")).rejects.toMatchObject({
        digest: REDIRECT_ERROR,
        url: expect.stringContaining("/treinos?treino=excluido"),
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/treinos/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});