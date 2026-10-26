export async function mensagemErroApi(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      body &&
      typeof body === "object" &&
      "erro" in body &&
      typeof body.erro === "string"
    ) {
      return body.erro;
    }

    if (body && typeof body === "object" && "erros" in body && Array.isArray(body.erros)) {
      const erros = body.erros.filter((erro): erro is string => typeof erro === "string");
      if (erros.length > 0) return erros.join(" ");
    }
  } catch (error) {
    if (error instanceof TypeError) {
      return "A conexão com o servidor foi interrompida. Verifique se a API está em execução e tente novamente.";
    }
  }

  return `${fallback} (HTTP ${response.status}).`;
}
