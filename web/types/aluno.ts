export type Aluno = {
  id: number;
  nome: string;
  email: string;
  peso: number;
  altura: number; // metros
  nivelExperiencia: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  frequenciaSemanal: number;
  status: "ATIVO" | "INATIVO";
  programaAtualId: number | null;
};
