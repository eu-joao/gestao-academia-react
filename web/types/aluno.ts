export type Aluno = {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: string; // ano-mes-dia
  peso: number;
  altura: number; // metros
  nivelExperiencia: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  frequenciaSemanal: number;
  status: "ATIVO" | "INATIVO";
};

export type AlunoRequest = Omit<Aluno, "id">;
