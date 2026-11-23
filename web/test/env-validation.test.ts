import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateProductionEnv,
  getSessionSecretBuffer,
  getAdminCredentialsValidated,
  SESSION_SECRET_HEX_LENGTH,
  SESSION_SECRET_BYTES,
} from "@/lib/env-validation";

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

describe("env-validation", () => {
  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv();
  });

  const VALID_SECRET = "a".repeat(64);
  const VALID_USER = "admin";
  const VALID_PASS = "senhaSegura123";

  function setupValidEnv() {
    setEnv({
      SESSION_SECRET: VALID_SECRET,
      ADMIN_USER: VALID_USER,
      ADMIN_PASS: VALID_PASS,
    });
  }

  describe("validateProductionEnv", () => {
    it("retorna valid=true com todas as variáveis corretas", () => {
      setupValidEnv();
      const result = validateProductionEnv();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("retorna erro quando SESSION_SECRET ausente", () => {
      setEnv({ ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("SESSION_SECRET não configurado");
    });

    it("retorna erro quando ADMIN_USER ausente", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ADMIN_USER não configurado");
    });

    it("retorna erro quando ADMIN_PASS ausente", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: VALID_USER });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ADMIN_PASS não configurado");
    });

    it("retorna erro quando SESSION_SECRET tem tamanho incorreto", () => {
      setEnv({ SESSION_SECRET: "a".repeat(63), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("SESSION_SECRET"))).toBe(true);
    });

    it("retorna erro quando SESSION_SECRET não é hex", () => {
      setEnv({ SESSION_SECRET: "g".repeat(64), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("SESSION_SECRET"))).toBe(true);
    });

    it("retorna erro quando ADMIN_USER é vazio", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: "   ", ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("ADMIN_USER"))).toBe(true);
    });

    it("retorna erro quando ADMIN_PASS é vazio", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: VALID_USER, ADMIN_PASS: "   " });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("ADMIN_PASS"))).toBe(true);
    });

    it("acumula múltiplos erros", () => {
      setEnv({ SESSION_SECRET: "curto", ADMIN_USER: "", ADMIN_PASS: "" });
      const result = validateProductionEnv();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });

    it("aceita SESSION_SECRET com letras maiúsculas", () => {
      setEnv({ SESSION_SECRET: "A".repeat(64), ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      const result = validateProductionEnv();
      expect(result.valid).toBe(true);
    });
  });

  describe("getSessionSecretBuffer", () => {
    it("retorna Buffer de 32 bytes quando válido", () => {
      setupValidEnv();
      const secret = getSessionSecretBuffer();
      expect(secret).toBeInstanceOf(Buffer);
      expect(secret.length).toBe(SESSION_SECRET_BYTES);
    });

    it("lança quando SESSION_SECRET ausente", () => {
      setEnv({ ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecretBuffer()).toThrow("SESSION_SECRET não configurado");
    });

    it("lança quando SESSION_SECRET inválido", () => {
      setEnv({ SESSION_SECRET: "invalid", ADMIN_USER: VALID_USER, ADMIN_PASS: VALID_PASS });
      expect(() => getSessionSecretBuffer()).toThrow("SESSION_SECRET inválido");
    });
  });

  describe("getAdminCredentialsValidated", () => {
    it("retorna credenciais quando válidas", () => {
      setupValidEnv();
      const creds = getAdminCredentialsValidated();
      expect(creds).toEqual({ usuario: VALID_USER, senha: VALID_PASS });
    });

    it("lança quando ADMIN_USER ausente", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_PASS: VALID_PASS });
      expect(() => getAdminCredentialsValidated()).toThrow("ADMIN_USER e ADMIN_PASS devem ser configurados");
    });

    it("lança quando ADMIN_PASS ausente", () => {
      setEnv({ SESSION_SECRET: VALID_SECRET, ADMIN_USER: VALID_USER });
      expect(() => getAdminCredentialsValidated()).toThrow("ADMIN_USER e ADMIN_PASS devem ser configurados");
    });
  });

  describe("constantes", () => {
    it("SESSION_SECRET_HEX_LENGTH é 64", () => {
      expect(SESSION_SECRET_HEX_LENGTH).toBe(64);
    });

    it("SESSION_SECRET_BYTES é 32", () => {
      expect(SESSION_SECRET_BYTES).toBe(32);
    });
  });
});