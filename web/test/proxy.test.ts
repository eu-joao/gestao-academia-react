import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSAO, createSessionCookie, isSessionValid, SESSION_TTL_SECONDS } from "@/lib/session";
import { base64UrlEncode } from "@/lib/crypto-utils";
import { createHmac } from "node:crypto";

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
  });
}

// Helper para criar NextRequest com cookies
function createRequest(pathname: string, cookieValue?: string): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  const request = new NextRequest(url);
  if (cookieValue !== undefined) {
    request.cookies.set(COOKIE_SESSAO, cookieValue);
  }
  return request;
}

// Helper para criar cookie assinado válido usando a implementação real
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

// Helper para criar cookie com iat no futuro (>60s)
function createFutureIatCookie(): string {
  const futureIat = Math.floor(Date.now() / 1000) + 120;
  const payload = { iat: futureIat, exp: futureIat + 3600 };
  const payloadBytes = Buffer.from(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  const secret = Buffer.from(VALID_SECRET, "hex");
  const hmac = createHmac("sha256", secret);
  hmac.update(payloadBytes);
  const signature = base64UrlEncode(hmac.digest());

  return `${payloadB64}.${signature}`;
}

// Helper para criar cookie com duração excessiva (> TTL + 60s)
function createExcessiveDurationCookie(): string {
  const now = Math.floor(Date.now() / 1000);
  const excessiveExp = now + SESSION_TTL_SECONDS + 120;
  const payload = { iat: now, exp: excessiveExp };
  const payloadBytes = Buffer.from(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  const secret = Buffer.from(VALID_SECRET, "hex");
  const hmac = createHmac("sha256", secret);
  hmac.update(payloadBytes);
  const signature = base64UrlEncode(hmac.digest());

  return `${payloadB64}.${signature}`;
}

// Helper para criar cookie com assinatura adulterada
function createTamperedSignatureCookie(): string {
  const cookie = createValidCookie();
  const [payload] = cookie.split(".");
  return `${payload}.assinaturaInvalida`;
}

// Helper para criar cookie com payload adulterado
function createTamperedPayloadCookie(): string {
  const cookie = createValidCookie();
  const [, signature] = cookie.split(".");
  const tamperedPayload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: 0, exp: 9999999999 })));
  return `${tamperedPayload}.${signature}`;
}

// Helper para criar cookie com assinatura de tamanho incorreto (16 bytes)
function createShortSignatureCookie(): string {
  const cookie = createValidCookie();
  const [payload] = cookie.split(".");
  const shortSig = base64UrlEncode(Buffer.alloc(16));
  return `${payload}.${shortSig}`;
}

// Helper para criar cookie com assinatura de tamanho incorreto (64 bytes)
function createLongSignatureCookie(): string {
  const cookie = createValidCookie();
  const [payload] = cookie.split(".");
  const longSig = base64UrlEncode(Buffer.alloc(64));
  return `${payload}.${longSig}`;
}

// Helper para criar cookie com base64url malformado na assinatura
function createMalformedSignatureCookie(): string {
  const cookie = createValidCookie();
  const [payload] = cookie.split(".");
  return `${payload}.!!!`;
}

describe("proxy middleware", () => {
  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
    setupValidEnv();
  });

  afterEach(() => {
    restoreEnv();
  });

  // Importa o proxy após configurar o ambiente
  async function importProxy() {
    const mod = await import("@/proxy");
    return mod.proxy;
  }

  describe("rota /login", () => {
    it("permite acesso a /login sem cookie", async () => {
      const proxy = await importProxy();
      const request = createRequest("/login");
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it("redireciona para / quando acessa /login com sessão válida", async () => {
      const proxy = await importProxy();
      const cookie = createValidCookie();
      const request = createRequest("/login", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // redirect status
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it("permite acesso a /login com cookie malformado (sessão inválida)", async () => {
      const proxy = await importProxy();
      const request = createRequest("/login", "cookie-malformado");
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it("permite acesso a /login com cookie vazio", async () => {
      const proxy = await importProxy();
      const request = createRequest("/login", "");
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });
  });

  describe("rotas administrativas (ex: /)", () => {
    it("redireciona para /login sem cookie", async () => {
      const proxy = await importProxy();
      const request = createRequest("/");
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com cookie malformado", async () => {
      const proxy = await importProxy();
      const request = createRequest("/", "invalido");
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com assinatura adulterada", async () => {
      const proxy = await importProxy();
      const cookie = createTamperedSignatureCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com sessão expirada", async () => {
      const proxy = await importProxy();
      const cookie = createExpiredCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("permite acesso com sessão válida", async () => {
      const proxy = await importProxy();
      const cookie = createValidCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it("redireciona para /login com payload adulterado", async () => {
      const proxy = await importProxy();
      const cookie = createTamperedPayloadCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com iat excessivamente no futuro (>60s)", async () => {
      const proxy = await importProxy();
      const cookie = createFutureIatCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com duração superior ao TTL + 60s", async () => {
      const proxy = await importProxy();
      const cookie = createExcessiveDurationCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com assinatura de 16 bytes (tamanho incorreto)", async () => {
      const proxy = await importProxy();
      const cookie = createShortSignatureCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com assinatura de 64 bytes (tamanho incorreto)", async () => {
      const proxy = await importProxy();
      const cookie = createLongSignatureCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("redireciona para /login com base64url malformado na assinatura", async () => {
      const proxy = await importProxy();
      const cookie = createMalformedSignatureCookie();
      const request = createRequest("/", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    });

    it("permite acesso a outras rotas administrativas com sessão válida (ex: /alunos)", async () => {
      const proxy = await importProxy();
      const cookie = createValidCookie();
      const request = createRequest("/alunos", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it("permite acesso a /treinos com sessão válida", async () => {
      const proxy = await importProxy();
      const cookie = createValidCookie();
      const request = createRequest("/treinos", cookie);
      const response = await proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });
  });

  describe("validação de isSessionValid usada pelo proxy", () => {
    it("retorna true para cookie criado por createSessionCookie", () => {
      const cookie = createValidCookie();
      expect(isSessionValid(cookie)).toBe(true);
    });

    it("retorna false para undefined", () => {
      expect(isSessionValid(undefined)).toBe(false);
    });

    it("retorna false para string vazia", () => {
      expect(isSessionValid("")).toBe(false);
    });
  });
});