export type TipoEstrutural = "FULLBODY" | "UPPER_LOWER" | "PPL_UPPER_LOWER" | "PPL_2X";

export type NivelExperiencia = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

export type ItemTreino = {
  id: number;
  diaTreinoId: number;
  nomeExercicio: string;
  musculaturaAlvo: string;
  series: number;
  repeticoes: string;
  ordem: number;
};

export type DiaTreino = {
  id: number;
  programaTreinoId: number;
  nome: string;
  ordem: number;
  itens: ItemTreino[];
};

export type ProgramaTreino = {
  id: number;
  nivelExperiencia: NivelExperiencia;
  frequenciaSemanal: number;
  tipoEstrutural: TipoEstrutural;
  descricao: string;
  dias: DiaTreino[];
};
