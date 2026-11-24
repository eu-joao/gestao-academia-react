import { timingSafeEqual } from "node:crypto";

/**
 * Comparação segura de strings com tamanho fixo baseado no valor ESPERADO (segredo).
 * O tempo de execução depende apenas do tamanho do segredo esperado, não do input do atacante.
 * Retorna false para quaisquer comprimentos diferentes, mesmo se o prefixo coincidir.
 * Não garante proteção absoluta contra timing attacks — apenas mitiga vazamento de comprimento do segredo.
 */
export function safeEqualFixed(expected: string, input: string): boolean {
  const expectedBuf = Buffer.from(expected);
  const inputBuf = Buffer.from(input);

  // Se comprimentos diferem, executa comparação timing-safe contra dummy do tamanho do ESPERADO
  // e retorna false — isso evita vazamento do tamanho do segredo via timing
  if (expectedBuf.length !== inputBuf.length) {
    timingSafeEqual(expectedBuf, Buffer.alloc(expectedBuf.length));
    return false;
  }

  // Comprimentos iguais: comparação timing-safe direta
  return timingSafeEqual(expectedBuf, inputBuf);
}

/**
 * Comparação segura de buffers com tamanho fixo baseado no buffer ESPERADO.
 * Usado para assinaturas HMAC onde o tamanho é conhecido (32 bytes para SHA-256).
 */
export function safeEqualBufferFixed(expected: Buffer, input: Buffer): boolean {
  if (expected.length !== input.length) {
    // Mesmo com tamanhos diferentes, executa comparação timing-safe contra dummy
    // do tamanho do ESPERADO para não vazar o tamanho esperado via timing
    timingSafeEqual(expected, Buffer.alloc(expected.length));
    return false;
  }
  return timingSafeEqual(expected, input);
}

/**
 * Codifica bytes em Base64URL (sem padding, seguro para cookies/URLs).
 * Produz saída canônica: sem padding, - em vez de +, _ em vez de /.
 */
export function base64UrlEncode(bytes: Buffer): string {
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decodifica Base64URL para Buffer.
 * Retorna null se a entrada for inválida, vazia, ou não decodificável.
 * Aceita tanto codificação canônica (sem padding) quanto com padding.
 * Rejeita caracteres fora do alfabeto Base64URL.
 */
export function base64UrlDecode(input: string): Buffer | null {
  if (!input || input.length === 0) return null;

  try {
    // Restaura caracteres Base64 padrão
    const padded = input.replace(/-/g, "+").replace(/_/g, "/");

    // Valida caracteres: apenas alfabeto Base64 + padding
    if (!/^[A-Za-z0-9+/=]+$/.test(padded)) return null;

    // Restaura padding se necessário
    const paddingNeeded = (4 - (padded.length % 4)) % 4;
    const withPadding = padded + "=".repeat(paddingNeeded);

    const decoded = Buffer.from(withPadding, "base64");

    // Base64 inválido ou vazio produz buffer vazio — rejeita se havia dados de entrada
    if (decoded.length === 0 && withPadding.length > 0) return null;

    return decoded;
  } catch {
    return null;
  }
}