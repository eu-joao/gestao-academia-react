export type Treino = {
  id: string; // UUID gerado pelo aplicativo mobile
  nome: string;
  categoria: string | null;
  diaSemana: string;
  duracaoMin: number;
  alunoId: number | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type TreinoRequest = {
  nome: string;
  categoria: string;
  diaSemana: string;
  duracaoMin: number;
};
