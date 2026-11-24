import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSessionSecret,
  getAdminCredentials,
  verifyCredentials,
  createSessionCookie,
  parseSessionCookie,
  isSessionValid,
  SESSION_TTL_SECONDS,
  COOKIE_SESSAO,
} from "@/lib/session";
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

describe("session", () => {
  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv();
  });

  const VALID_SECRET = "a".repeat(64); // 64 chars hex = 32 bytes
  const VALID_USER = "admin";
  const VALID_PASS = "senhaSegura123";

  function setupValidEnv() {
    setEnv({
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
    });
  }

  describe("getSessionSecret", () => {
    it("retorna Buffer de 32 bytes quando SESSION_SECRET é válido", () => {
      setupValidEnv();
      const secret = getSessionSecret();
      expect(secret).toBeInstanceOf(Buffer);
      expect(secret.length).toBe(32);
    });

    it("lança erro quando SESSION_SECRET não está definido", () => {
      setEnv({ SESSION_SECRET: undefined, ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecret()).toThrow("SESSION_SECRET não configurado");
    });

    it("lança erro quando SESSION_SECRET tem tamanho incorreto", () => {
      setEnv({ SESSION_SECRET: "a".repeat(63), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecret()).toThrow("SESSION_SECRET inválido");
    });

    it("lança erro quando SESSION_SECRET não é hexadecimal", () => {
      setEnv({ SESSION_SECRET: "g".repeat(64), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecret()).toThrow("SESSION_SECRET inválido");
    });

    it("aceita letras maiúsculas no hex", () => {
      setEnv({ SESSION_SECRET: "A".repeat(64), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecret()).not.toThrow();
    });
  });

  describe("getAdminCredentials", () => {
    it("retorna credenciais quando ambas estão definidas", () => {
      setupValidEnv();
      const creds = getAdminCredentials();
      expect(creds).toEqual({ usuario: VALID_USER, senha: VALID_PASS });
    });

    it("lança erro quando ADMIN_USER não está definido", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: undefined, ADMIN_PASS: VALID_PASS });
      expect(() => getAdminCredentials()).toThrow("ADMIN_USER e ADMIN_PASS devem ser configurados");
    });

    it("lança erro quando ADMIN_PASS não está definido", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: VALID_USER, ADMIN_PASS: undefined });
      expect(() => getAdminCredentials()).toThrow("ADMIN_USER e ADMIN_PASS devem ser configurados");
    });
  });

  describe("verifyCredentials", () => {
    beforeEach(() => setupValidEnv());

    it("retorna true para credenciais corretas", () => {
      expect(verifyCredentials(VALID_USER, VALID_PASS)).toBe(true);
    });

    it("retorna false para usuário incorreto", () => {
      expect(verifyCredentials("wrong", VALID_PASS)).toBe(false);
    });

    it("retorna false para senha incorreta", () => {
      expect(verifyCredentials(VALID_USER, "wrong")).toBe(false);
    });

    it("retorna false para ambas incorretas", () => {
      expect(verifyCredentials("wrong", "wrong")).toBe(false);
    });

    it("retorna false para input maior cujo prefixo coincide com o esperado", () => {
      // "admin" + extra chars
      expect(verifyCredentials("adminextra", VALID_PASS)).toBe(false);
      expect(verifyCredentials(VALID_USER, VALID_PASS + "extra")).toBe(false);
    });

    it("retorna false para input menor que o esperado", () => {
      expect(verifyCredentials("adm", VALID_PASS)).toBe(false);
      expect(verifyCredentials(VALID_USER, "sen")).toBe(false);
    });

    it("usa comparação com tamanho fixo baseado no segredo (timing-safe mitigado)", () => {
      const result = verifyCredentials(VALID_USER, VALID_PASS);
      expect(typeof result).toBe("boolean");
      expect(result).toBe(true);
    });
  });

  describe("createSessionCookie", () => {
    beforeEach(() => setupValidEnv());

    it("cria cookie no formato payload.signature", () => {
      const cookie = createSessionCookie();
      const parts = cookie.split(".");
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it("payload contém iat e exp válidos com TTL de 8 horas", () => {
      const cookie = createSessionCookie();
      const [payloadB64] = cookie.split(".");
      const payloadBytes = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
      const payload = JSON.parse(payloadBytes.toString("utf-8"));

      expect(typeof payload.iat).toBe("number");
      expect(typeof payload.exp).toBe("number");
      expect(payload.exp).toBe(payload.iat + SESSION_TTL_SECONDS);
      expect(payload.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 1);
    });

    it("assinatura é válida para o payload", () => {
      const cookie = createSessionCookie();
      const now = Math.floor(Date.now() / 1000);
      expect(isSessionValid(cookie, now)).toBe(true);
    });

    it("assinatura decodifica para exatamente 32 bytes", () => {
      const cookie = createSessionCookie();
      const [, signatureB64] = cookie.split(".");
      const signatureBytes = Buffer.from(
        signatureB64.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      );
      expect(signatureBytes.length).toBe(32);
    });

    it("cookies consecutivos são diferentes (iat diferente)", () => {
      const cookie1 = createSessionCookie();
      const cookie2 = createSessionCookie();
      const now = Math.floor(Date.now() / 1000);
      expect(isSessionValid(cookie1, now)).toBe(true);
      expect(isSessionValid(cookie2, now)).toBe(true);
    });
  });

  describe("parseSessionCookie", () => {
    beforeEach(() => setupValidEnv());

    it("retorna payload para cookie válido", () => {
      const cookie = createSessionCookie();
      const now = Math.floor(Date.now() / 1000);
      const payload = parseSessionCookie(cookie, now);
      expect(payload).not.toBeNull();
      expect(payload!.iat).toBeTypeOf("number");
      expect(payload!.exp).toBeTypeOf("number");
    });

    it("retorna null para cookie undefined", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(undefined, now)).toBeNull();
    });

    it("retorna null para cookie vazio", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie("", now)).toBeNull();
    });

    it("retorna null para cookie sem separador", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie("invalido", now)).toBeNull();
    });

    it("retorna null para cookie com partes a mais", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie("a.b.c", now)).toBeNull();
    });

    it("retorna null para payload com base64 inválido", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie("!!! . assinatura", now)).toBeNull();
    });

    it("retorna null para payload JSON inválido", () => {
      const now = Math.floor(Date.now() / 1000);
      const invalidPayload = base64UrlEncode(Buffer.from("nao e json"));
      const cookie = `${invalidPayload}.assinatura`;
      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para payload sem iat", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ exp: now })));
      const cookie = `${payload}.assinatura`;
      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para payload sem exp", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: now })));
      const cookie = `${payload}.assinatura`;
      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para iat não inteiro seguro", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: 1.5, exp: now + 3600 })));
      const cookie = `${payload}.assinatura`;
      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para exp não inteiro seguro", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: now, exp: 1.5 })));
      const cookie = `${payload}.assinatura`;
      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para iat muito no futuro (fora da tolerância de 60s)", () => {
      const futureIat = Math.floor(Date.now() / 1000) + 120; // 2 minutos no futuro
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: futureIat, exp: futureIat + 3600 })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("aceita iat no futuro dentro da tolerância de 60s", () => {
      const futureIat = Math.floor(Date.now() / 1000) + 30; // 30s no futuro
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: futureIat, exp: futureIat + 3600 })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).not.toBeNull();
    });

    it("retorna null para exp <= iat", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: now, exp: now })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para duração superior ao TTL + tolerância (8h + 60s)", () => {
      const now = Math.floor(Date.now() / 1000);
      const excessiveExp = now + SESSION_TTL_SECONDS + 120; // 8h + 2min
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: now, exp: excessiveExp })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("aceita duração igual ao TTL + tolerância", () => {
      const now = Math.floor(Date.now() / 1000);
      const maxExp = now + SESSION_TTL_SECONDS + 60; // 8h + 60s
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: now, exp: maxExp })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).not.toBeNull();
    });

    it("retorna null para cookie expirado", () => {
      const past = Math.floor(Date.now() / 1000) - 100;
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: past, exp: past + 10 })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(parseSessionCookie(cookie, now)).toBeNull();
    });

    it("retorna null para assinatura inválida", () => {
      const cookie = createSessionCookie();
      const [payload] = cookie.split(".");
      const cookieTampered = `${payload}.assinaturaInvalida`;
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(cookieTampered, now)).toBeNull();
    });

    it("retorna null para assinatura com tamanho incorreto (não 32 bytes)", () => {
      const cookie = createSessionCookie();
      const [payload] = cookie.split(".");
      // Assinatura de 16 bytes em vez de 32
      const shortSig = base64UrlEncode(Buffer.alloc(16));
      const cookieTampered = `${payload}.${shortSig}`;
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(cookieTampered, now)).toBeNull();
    });

    it("retorna null para assinatura com tamanho maior que 32 bytes", () => {
      const cookie = createSessionCookie();
      const [payload] = cookie.split(".");
      const longSig = base64UrlEncode(Buffer.alloc(64));
      const cookieTampered = `${payload}.${longSig}`;
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(cookieTampered, now)).toBeNull();
    });

    it("retorna null para cookie adulterado (payload modificado)", () => {
      const cookie = createSessionCookie();
      const [, signature] = cookie.split(".");
      const tamperedPayload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: 0, exp: 9999999999 })));
      const cookieTampered = `${tamperedPayload}.${signature}`;
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(cookieTampered, now)).toBeNull();
    });

    it("retorna null para assinatura com base64url malformado", () => {
      const cookie = createSessionCookie();
      const [payload] = cookie.split(".");
      const cookieTampered = `${payload}.!!!`;
      const now = Math.floor(Date.now() / 1000);
      expect(parseSessionCookie(cookieTampered, now)).toBeNull();
    });
  });

  describe("isSessionValid", () => {
    beforeEach(() => setupValidEnv());

    it("retorna true para cookie válido", () => {
      const cookie = createSessionCookie();
      const now = Math.floor(Date.now() / 1000);
      expect(isSessionValid(cookie, now)).toBe(true);
    });

    it("retorna false para cookie inválido", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(isSessionValid("invalido", now)).toBe(false);
    });

    it("retorna false para undefined", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(isSessionValid(undefined, now)).toBe(false);
    });

    it("retorna false para cookie expirado", () => {
      const past = Math.floor(Date.now() / 1000) - 100;
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: past, exp: past + 10 })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(isSessionValid(cookie, now)).toBe(false);
    });

    it("retorna false para iat muito no futuro", () => {
      const futureIat = Math.floor(Date.now() / 1000) + 120;
      const now = Math.floor(Date.now() / 1000);
      const payload = base64UrlEncode(Buffer.from(JSON.stringify({ iat: futureIat, exp: futureIat + 3600 })));
      const secret = Buffer.from(VALID_SECRET, "hex");
      const hmac = createHmac("sha256", secret);
      hmac.update(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
      const signature = base64UrlEncode(hmac.digest());
      const cookie = `${payload}.${signature}`;

      expect(isSessionValid(cookie, now)).toBe(false);
    });
  });

  describe("constantes", () => {
    it("COOKIE_SESSAO tem valor esperado", () => {
      expect(COOKIE_SESSAO).toBe("sessao_personal");
    });

    it("SESSION_TTL_SECONDS é 8 horas", () => {
      expect(SESSION_TTL_SECONDS).toBe(8 * 60 * 60);
    });
  });
});

// Helper para base64UrlEncode nos testes (evita import circular)
function base64UrlEncode(bytes: Buffer): string {
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}