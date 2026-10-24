export type ErrosTreino = {
  nome?: string;
  diaSemana?: string;
  duracaoMin?: string;
};

type DadosFormulario = {
  nome: string;
  diaSemana: string;
  duracaoMin: string;
};

export function validarTreino({
  nome,
  diaSemana,
  duracaoMin,
}: DadosFormulario): ErrosTreino {
  const erros: ErrosTreino = {};

  if (nome.trim().length < 3) {
    erros.nome = "O nome do treino deve ter pelo menos 3 caracteres.";
  }

  if (!diaSemana.trim()) {
    erros.diaSemana = "O dia da semana é obrigatório.";
  }

  const texto = duracaoMin.trim();
  const duracao = Number(texto);

  if (!/^\d+$/.test(texto) || duracao < 1 || duracao > 300) {
    erros.duracaoMin = "A duração deve ser um número inteiro entre 1 e 300.";
  }

  return erros;
}

