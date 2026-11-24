import { describe, it, expect } from "vitest";
import {
  safeEqualFixed,
  safeEqualBufferFixed,
  base64UrlEncode,
  base64UrlDecode,
} from "@/lib/crypto-utils";

describe("crypto-utils", () => {
  describe("safeEqualFixed", () => {
    it("retorna true para strings idênticas", () => {
      expect(safeEqualFixed("hello", "hello")).toBe(true);
    });

    it("retorna false para strings diferentes do mesmo tamanho", () => {
      expect(safeEqualFixed("hello", "world")).toBe(false);
    });

    it("retorna false para input menor que o esperado", () => {
      expect(safeEqualFixed("hello", "he")).toBe(false);
    });

    it("retorna false para input maior que o esperado", () => {
      expect(safeEqualFixed("he", "hello")).toBe(false);
    });

    it("retorna false para input maior cujo prefixo coincide com o esperado", () => {
      // "hello" prefixado com "hello" + mais caracteres
      expect(safeEqualFixed("hello", "helloworld")).toBe(false);
    });

    it("retorna false para input vazio quando esperado não é vazio", () => {
      expect(safeEqualFixed("hello", "")).toBe(false);
    });

    it("retorna true para ambos vazios", () => {
      expect(safeEqualFixed("", "")).toBe(true);
    });

    it("retorna false para expected vazio e input não vazio", () => {
      expect(safeEqualFixed("", "a")).toBe(false);
    });

    it("funciona com caracteres especiais e unicode", () => {
      expect(safeEqualFixed("café 🎉", "café 🎉")).toBe(true);
      expect(safeEqualFixed("café 🎉", "cafe 🎉")).toBe(false);
    });

    it("tempo de execução não vaza tamanho do segredo (teste de fumaça)", () => {
      // Apenas verifica que não lança e retorna boolean consistente
      const result1 = safeEqualFixed("segredo123", "segredo123");
      const result2 = safeEqualFixed("segredo123", "errado");
      const result3 = safeEqualFixed("segredo123", "segredo123extra");
      expect(typeof result1).toBe("boolean");
      expect(typeof result2).toBe("boolean");
      expect(typeof result3).toBe("boolean");
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe("safeEqualBufferFixed", () => {
    it("retorna true para buffers idênticos", () => {
      const a = Buffer.from("hello");
      const b = Buffer.from("hello");
      expect(safeEqualBufferFixed(a, b)).toBe(true);
    });

    it("retorna false para buffers diferentes do mesmo tamanho", () => {
      const a = Buffer.from("hello");
      const b = Buffer.from("world");
      expect(safeEqualBufferFixed(a, b)).toBe(false);
    });

    it("retorna false para buffer input menor que esperado", () => {
      const expected = Buffer.from("hello");
      const input = Buffer.from("he");
      expect(safeEqualBufferFixed(expected, input)).toBe(false);
    });

    it("retorna false para buffer input maior que esperado", () => {
      const expected = Buffer.from("he");
      const input = Buffer.from("hello");
      expect(safeEqualBufferFixed(expected, input)).toBe(false);
    });

    it("retorna false para input maior cujo prefixo coincide", () => {
      const expected = Buffer.from("hello");
      const input = Buffer.from("helloworld");
      expect(safeEqualBufferFixed(expected, input)).toBe(false);
    });

    it("retorna true para buffers vazios", () => {
      expect(safeEqualBufferFixed(Buffer.alloc(0), Buffer.alloc(0))).toBe(true);
    });

    it("retorna false para expected vazio e input não vazio", () => {
      expect(safeEqualBufferFixed(Buffer.alloc(0), Buffer.from("a"))).toBe(false);
    });
  });

  describe("base64UrlEncode", () => {
    it("codifica bytes simples", () => {
      const input = Buffer.from("hello");
      const encoded = base64UrlEncode(input);
      expect(encoded).toBe("aGVsbG8");
    });

    it("substitui + por - e / por _", () => {
      // 0xfb 0xef -> base64: "++8=" -> base64url: "--8"
      const input = Buffer.from([0xfb, 0xef]);
      const encoded = base64UrlEncode(input);
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
      expect(encoded).toBe("--8");
    });

    it("remove padding =", () => {
      const input = Buffer.from("a"); // base64: "YQ==" -> base64url: "YQ"
      const encoded = base64UrlEncode(input);
      expect(encoded).not.toContain("=");
      expect(encoded).toBe("YQ");
    });

    it("produz saída canônica (determinística)", () => {
      const input = Buffer.from("test");
      const encoded1 = base64UrlEncode(input);
      const encoded2 = base64UrlEncode(input);
      expect(encoded1).toBe(encoded2);
    });
  });

  describe("base64UrlDecode", () => {
    it("decodifica string base64url válida canônica", () => {
      const decoded = base64UrlDecode("aGVsbG8");
      expect(decoded).toEqual(Buffer.from("hello"));
    });

    it("decodifica string com padding (não canônica mas aceita)", () => {
      const decoded = base64UrlDecode("aGVsbG8=");
      expect(decoded).toEqual(Buffer.from("hello"));
    });

    it("restaura - para + e _ para /", () => {
      const decoded = base64UrlDecode("-_8");
      expect(decoded).toEqual(Buffer.from([0xfb, 0xff]));
    });

    it("restaura padding automaticamente", () => {
      const decoded = base64UrlDecode("YQ");
      expect(decoded).toEqual(Buffer.from("a"));
    });

    it("retorna null para entrada vazia", () => {
      expect(base64UrlDecode("")).toBeNull();
    });

    it("retorna null para entrada undefined", () => {
      // @ts-expect-error - teste de tipo inválido
      expect(base64UrlDecode(undefined)).toBeNull();
    });

    it("retorna null para caracteres inválidos", () => {
      expect(base64UrlDecode("!!!")).toBeNull();
      expect(base64UrlDecode("abc$")).toBeNull();
      expect(base64UrlDecode("abc ")).toBeNull();
    });

    it("retorna null para base64 que decodifica para vazio mas tinha entrada", () => {
      // "==" decodifica para buffer vazio mas tinha padding
      expect(base64UrlDecode("==")).toBeNull();
    });

    it("round-trip: encode -> decode retorna original", () => {
      const original = Buffer.from("teste com caracteres especiais: café 🎉");
      const encoded = base64UrlEncode(original);
      const decoded = base64UrlDecode(encoded);
      expect(decoded).toEqual(original);
    });

    it("round-trip com padding na entrada", () => {
      const original = Buffer.from("a");
      base64UrlEncode(original); // "YQ" - usado para demonstrar round-trip
      const withPadding = "YQ==";
      const decoded = base64UrlDecode(withPadding);
      expect(decoded).toEqual(original);
    });
  });
});