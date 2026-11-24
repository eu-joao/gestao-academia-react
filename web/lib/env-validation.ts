/**
 * Validação centralizada de variáveis de ambiente de produção.
 * Evita duplicação entre session.ts e instrumentation.ts.
 */

export const SESSION_SECRET_HEX_LENGTH = 64;
export const SESSION_SECRET_BYTES = 32;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateSessionSecret(value: string): string | null {
  if (value.length !== SESSION_SECRET_HEX_LENGTH || !/^[0-9a-fA-F]{64}$/.test(value)) {
    return "SESSION_SECRET: deve ser exatamente 64 caracteres hexadecimais (32 bytes)";
  }
  return null;
}

function validateNonEmpty(value: string, name: string): string | null {
  if (value.trim().length === 0) {
    return `${name}: não pode ser vazio`;
  }
  return null;
}

/**
 * Valida todas as variáveis de ambiente necessárias para produção.
 * Retorna objeto com resultado e lista de erros (vazio se válido).
 * Não lança exceção — deixa o chamador decidir como tratar.
 */
export function validateProductionEnv(): ValidationResult {
  const errors: string[] = [];

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    errors.push("SESSION_SECRET não configurado");
  } else {
    const err = validateSessionSecret(sessionSecret);
    if (err) errors.push(err);
  }

  const adminUser = process.env.ADMIN_USER;
  if (!adminUser) {
    errors.push("ADMIN_USER não configurado");
  } else {
    const err = validateNonEmpty(adminUser, "ADMIN_USER");
    if (err) errors.push(err);
  }

  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) {
    errors.push("ADMIN_PASS não configurado");
  } else {
    const err = validateNonEmpty(adminPass, "ADMIN_PASS");
    if (err) errors.push(err);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Obtém o segredo da sessão validado como Buffer.
 * Lança se inválido — para uso em runtime de sessão.
 */
export function getSessionSecretBuffer(): Buffer {
  const secretHex = process.env.SESSION_SECRET;
  if (!secretHex) {
    throw new Error("SESSION_SECRET não configurado");
  }
  if (secretHex.length !== SESSION_SECRET_HEX_LENGTH || !/^[0-9a-fA-F]{64}$/.test(secretHex)) {
    throw new Error("SESSION_SECRET inválido: deve ser exatamente 64 caracteres hexadecimais (32 bytes)");
  }
  return Buffer.from(secretHex, "hex");
}

/**
 * Obtém credenciais de admin validadas.
 * Lança se inválido — para uso em runtime de sessão.
 */
export function getAdminCredentialsValidated(): { usuario: string; senha: string } {
  const usuario = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASS;
  if (!usuario || !senha) {
    throw new Error("ADMIN_USER e ADMIN_PASS devem ser configurados");
  }
  return { usuario, senha };
}