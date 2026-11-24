export type StatusCobranca = "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";

export type Cobranca = {
  id: number;
  contratoId: number;
  numeroParcela: number;
  dataVencimento: string; // ano-mes-dia
  valor: number;
  status: StatusCobranca;
  dataPagamento: string | null; // ano-mes-dia
};
