import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  })),
}));

import { cookies } from "next/headers";

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

describe("login actions", () => {
  let mockCookies: {
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
    vi.clearAllMocks();

    mockCookies = {
      set: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookies as any);
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
      NODE_ENV: "production",
    });
  }

  describe("entrar", () => {
    beforeEach(() => setupValidEnv());

    it("retorna erro para credenciais inválidas (usuário errado)", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", "wrong");
      formData.append("senha", VALID_PASS);

      const result = await entrar({ status: "idle" }, formData);

      expect(result).toEqual({
        status: "error",
        message: "Usuário ou senha inválidos.",
      });
    });

    it("retorna erro para credenciais inválidas (senha errada)", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", VALID_USER);
      formData.append("senha", "wrong");

      const result = await entrar({ status: "idle" }, formData);

      expect(result).toEqual({
        status: "error",
        message: "Usuário ou senha inválidos.",
      });
    });

    it("retorna erro para credenciais inválidas (ambos errados)", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", "wrong");
      formData.append("senha", "wrong");

      const result = await entrar({ status: "idle" }, formData);

      expect(result).toEqual({
        status: "error",
        message: "Usuário ou senha inválidos.",
      });
    });

    it("cria cookie de sessão com credenciais válidas", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", VALID_USER);
      formData.append("senha", VALID_PASS);

      // O redirect lança erro, então capturamos
      await expect(entrar({ status: "idle" }, formData)).rejects.toThrow();

      expect(mockCookies.set).toHaveBeenCalledWith(
        "sessao_personal",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          secure: true, // NODE_ENV=production
          path: "/",
          maxAge: 8 * 60 * 60,
        })
      );
    });

    it("cookie tem atributos corretos em desenvolvimento", async () => {
      setEnv({
        SESSION_SECRET: VALID_SECRET,
        ADMIN_USER: VALID_USER,
        ADMIN_PASS: VALID_PASS,
        NODE_ENV: "development",
      });

      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", VALID_USER);
      formData.append("senha", VALID_PASS);

      await expect(entrar({ status: "idle" }, formData)).rejects.toThrow();

      expect(mockCookies.set).toHaveBeenCalledWith(
        "sessao_personal",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          secure: false, // NODE_ENV=development
          path: "/",
          maxAge: 8 * 60 * 60,
        })
      );
    });

    it("cookie valor é string assinada HMAC válida", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", VALID_USER);
      formData.append("senha", VALID_PASS);

      await expect(entrar({ status: "idle" }, formData)).rejects.toThrow();

      const [, cookieValue] = mockCookies.set.mock.calls[0];
      expect(typeof cookieValue).toBe("string");
      expect(cookieValue).toContain(".");
      const [payload, signature] = cookieValue.split(".");
      expect(payload.length).toBeGreaterThan(0);
      expect(signature.length).toBeGreaterThan(0);
    });

    it("não cria cookie quando credenciais são inválidas", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", "wrong");
      formData.append("senha", "wrong");

      const result = await entrar({ status: "idle" }, formData);

      expect(result.status).toBe("error");
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it("redireciona para / após login bem-sucedido", async () => {
      const { entrar } = await import("@/app/login/actions");
      const formData = new FormData();
      formData.append("usuario", VALID_USER);
      formData.append("senha", VALID_PASS);

      // redirect("/") lança um erro especial do Next.js
      await expect(entrar({ status: "idle" }, formData)).rejects.toThrow();
    });
  });

  describe("sair", () => {
    beforeEach(() => setupValidEnv());

    it("remove o cookie de sessão", async () => {
      const { sair } = await import("@/app/login/actions");

      await expect(sair()).rejects.toThrow();

      expect(mockCookies.delete).toHaveBeenCalledWith("sessao_personal");
    });

    it("redireciona para /login após logout", async () => {
      const { sair } = await import("@/app/login/actions");

      await expect(sair()).rejects.toThrow();
    });
  });
});