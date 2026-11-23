// Login simulado do portal do personal.
// O acesso é restrito por um cookie de sessão; as credenciais vêm de variáveis
// de ambiente do servidor Next.js (nunca são enviadas ao navegador).

export const COOKIE_SESSAO = "sessao_personal";

export function credenciaisEsperadas() {
  return {
    usuario: process.env.ADMIN_USER ?? "admin",
    senha: process.env.ADMIN_PASS ?? "admin123",
  };
}

async function sha256(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Valor gravado no cookie: derivado das credenciais, para não ser um valor fixo
// e previsível. É uma proteção simulada, adequada apenas ao contexto acadêmico.
export async function valorDaSessao() {
  const { usuario, senha } = credenciaisEsperadas();
  return sha256(`${usuario}:${senha}`);
}
