import asyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@academia:treinos ";

export type Treino = {
  id: string;
  nome: string;
  categoria?: string;
  diaSemana: string;
  duracaoMin: number;
};

export type TreinoInput = Omit<Treino, "id">;

export async function listar(): Promise<Treino[]> {
  const json = await asyncStorage.getItem(KEY);
  return json ? (JSON.parse(json) as Treino[]) : [];
}

export async function salvar(lista: Treino[]): Promise<void> {
  await asyncStorage.setItem(KEY, JSON.stringify(lista));
}

export async function adicionar(dados: TreinoInput): Promise<Treino> {
  const lista = await listar();
  const novo: Treino = { id: Date.now().toString(), ...dados };
  await salvar([...lista, novo]);
  return novo;
}

export async function atualizar(id: string, dados: TreinoInput): Promise<void> {
  const lista = await listar();
  await salvar(lista.map((t) => (t.id === id ? { ...t, ...dados } : t)));
}

export async function remover(id: string): Promise<void> {
  const lista = await listar();
  await salvar(lista.filter((t) => t.id !== id));
}

export async function buscarPorId(id: string): Promise<Treino | undefined> {
  const lista = await listar();
  return lista.find((t) => t.id === id);
}
