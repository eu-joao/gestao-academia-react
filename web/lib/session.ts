import { createHmac } from "node:crypto";
import {
  safeEqualFixed,
  safeEqualBufferFixed,
  base64UrlEncode,
  base64UrlDecode,
} from "./crypto-utils";
import {
  getSessionSecretBuffer,
  getAdminCredentialsValidated,
  SESSION_SECRET_BYTES,
} from "./env-validation";

// Re-exports para compatibilidade com API anterior
export { getSessionSecretBuffer as getSessionSecret } from "./env-validation";
export { getAdminCredentialsValidated as getAdminCredentials } from "./env-validation";

export const COOKIE_SESSAO = "sessao_personal";

// Tempo de expiração da sessão: 8 horas em segundos (alinhado com configuração anterior do projeto)
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

// Tolerância de relógio em segundos para iat no futuro
const CLOCK_SKEW_TOLERANCE_SECONDS = 60;

/**
 * Verifica se as credenciais fornecidas correspondem às credenciais de admin.
 * Usa comparação com tamanho fixo baseado no segredo esperado para mitigar timing attacks.
 * Não garante proteção absoluta — apenas mitiga vazamento de comprimento da credencial esperada.
 */
export function verifyCredentials(usuario: string, senha: string): boolean {
  const expected = getAdminCredentialsValidated();
  return (
    safeEqualFixed(expected.usuario, usuario) &&
    safeEqualFixed(expected.senha, senha)
  );
}

/**
 * Cria o cookie de sessão assinado com HMAC-SHA256.
 * Payload: { iat: number, exp: number }
 * Formato: base64url(payload).base64url(signature)
 * A assinatura tem exatamente 32 bytes (256 bits).
 */
export function createSessionCookie(): string {
  const secret = getSessionSecretBuffer();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadBytes = Buffer.from(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  // HMAC-SHA256 do payload
  const hmac = createHmac("sha256", secret);
  hmac.update(payloadBytes);
  const signature = hmac.digest();
  const signatureB64 = base64UrlEncode(signature);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Parseia e valida o cookie de sessão.
 * Retorna o payload se válido, null caso contrário.
 * Validações:
 * - Formato payload.signature
 * - Assinatura HMAC-SHA256 válida (32 bytes) - VERIFICADA ANTES de interpretar o payload
 * - Payload JSON válido com iat e exp inteiros seguros
 * - iat não muito no futuro (tolerância de 60s)
 * - exp > iat
 * - Duração (exp - iat) não excede TTL + tolerância
 * - Sessão não expirada
 *
 * @param cookieValue - Valor do cookie de sessão
 * @param now - Timestamp atual em segundos (obrigatório). Deve ser fornecido pelo chamador
 *   após acesso dinâmico (ex.: `await cookies()`), para evitar instabilidade em prerender.
 */
export function parseSessionCookie(
  cookieValue: string | undefined,
  now: number,
): { iat: number; exp: number } | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  // Decodifica payload e signature
  const payloadBytes = base64UrlDecode(payloadB64);
  if (!payloadBytes) return null;

  const receivedSignature = base64UrlDecode(signatureB64);
  if (!receivedSignature || receivedSignature.length !== SESSION_SECRET_BYTES) return null;

  // VERIFICA ASSINATURA HMAC ANTES de interpretar o payload (segurança: não processa dados não autenticados)
  const secret = getSessionSecretBuffer();
  const expectedHmac = createHmac("sha256", secret);
  expectedHmac.update(payloadBytes);
  const expectedSignature = expectedHmac.digest();

  // Comparação timing-safe com tamanho fixo (32 bytes)
  if (!safeEqualBufferFixed(expectedSignature, receivedSignature)) return null;

  // Só após HMAC válido: parseia e valida o payload
  let payload: { iat: number; exp: number };
  try {
    payload = JSON.parse(payloadBytes.toString("utf-8"));
  } catch {
    return null;
  }

  // Valida estrutura do payload: iat e exp devem ser inteiros seguros (Number.isSafeInteger)
  if (!Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp)) return null;

  // Rejeita iat muito no futuro (clock skew tolerado: 60s)
  if (payload.iat > now + CLOCK_SKEW_TOLERANCE_SECONDS) return null;

  // Rejeita exp <= iat
  if (payload.exp <= payload.iat) return null;

  // Rejeita duração excessiva (TTL + tolerância)
  const maxDuration = SESSION_TTL_SECONDS + CLOCK_SKEW_TOLERANCE_SECONDS;
  if (payload.exp - payload.iat > maxDuration) return null;

  // Verifica expiração
  if (payload.exp < now) return null;

  return payload;
}

/**
 * Verifica se um cookie de sessão é válido (wrapper conveniente).
 * @param cookieValue - Valor do cookie de sessão
 * @param now - Timestamp atual em segundos (obrigatório). Deve ser fornecido pelo chamador
 *   após acesso dinâmico (ex.: `await cookies()`), para evitar instabilidade em prerender.
 */
export function isSessionValid(
  cookieValue: string | undefined,
  now: number,
): boolean {
  return parseSessionCookie(cookieValue, now) !== null;
}