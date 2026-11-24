export type TipoPlano = "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";

export type StatusContrato = "ATIVO" | "ENCERRADO" | "CANCELADO";

export type Contrato = {
  id: number;
  alunoId: number;
  plano: TipoPlano;
  dataInicio: string; // ano-mes-dia
  dataTermino: string; // ano-mes-dia
  status: StatusContrato;
};

export type ContratoRequest = {
  alunoId: number;
  plano: TipoPlano;
  dataInicio: string; // ano-mes-dia
};
