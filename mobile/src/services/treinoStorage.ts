import asyncStorage from "@react-native-async-storage/async-storage";
import { requisicao } from "./api";
import { enfileirar, processarFila } from "./syncQueue";

const KEY = "@academia:treinos";

export type Treino = {
  id: string;
  nome: string;
  categoria?: string;
  diaSemana: string;
  duracaoMin: number;
  ativo?: boolean;
};

export type TreinoInput = Omit<Treino, "id">;

export function gerarUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function listar(): Promise<Treino[]> {
  // 1. Carrega imediatamente do armazenamento local (UI instantânea e 100% offline)
  const localJson = await asyncStorage.getItem(KEY);
  const listaLocal: Treino[] = localJson
    ? (JSON.parse(localJson) as Treino[])
    : [];

  // 2. Dispara sincronização em segundo plano com a nuvem (sem bloquear o retorno)
  sincronizarComNuvem(listaLocal).catch(() => {
    // Falha silenciosa em caso de sem internet (continua operando offline)
  });

  return listaLocal;
}

export const obterTreinos = listar;

export async function salvar(lista: Treino[]): Promise<void> {
  await asyncStorage.setItem(KEY, JSON.stringify(lista));
}

export async function adicionar(dados: TreinoInput): Promise<Treino> {
  const lista = await listarLocalmente();
  const id = gerarUUID();
  const novo: Treino = { id, ...dados };

  // 1. Salva localmente de imediato
  await salvar([...lista, novo]);

  // 2. Enfileira na fila de sincronização para a API Spring Boot
  const payload = {
    id: novo.id,
    nome: novo.nome,
    categoria: novo.categoria,
    diaSemana: novo.diaSemana,
    duracaoMin: novo.duracaoMin,
  };
  await enfileirar("CREATE", novo.id, payload);

  return novo;
}

export async function atualizar(id: string, dados: TreinoInput): Promise<void> {
  const lista = await listarLocalmente();
  const atualizada = lista.map((t) => (t.id === id ? { ...t, ...dados } : t));

  // 1. Atualiza localmente de imediato
  await salvar(atualizada);

  // 2. Enfileira alteração na fila de sincronização
  const payload = {
    nome: dados.nome,
    categoria: dados.categoria,
    diaSemana: dados.diaSemana,
    duracaoMin: dados.duracaoMin,
  };
  await enfileirar("UPDATE", id, payload);
}

export async function remover(id: string): Promise<void> {
  const lista = await listarLocalmente();
  const filtrada = lista.filter((t) => t.id !== id);

  // 1. Remove localmente de imediato
  await salvar(filtrada);

  // 2. Enfileira exclusão na fila de sincronização
  await enfileirar("DELETE", id);
}

export async function buscarPorId(id: string): Promise<Treino | undefined> {
  const lista = await listarLocalmente();
  return lista.find((t) => t.id === id);
}

// Helpers internos
async function listarLocalmente(): Promise<Treino[]> {
  const json = await asyncStorage.getItem(KEY);
  return json ? (JSON.parse(json) as Treino[]) : [];
}

async function sincronizarComNuvem(locais: Treino[]): Promise<void> {
  // Primeiro, processa qualquer requisição pendente na fila
  await processarFila();

  // Em seguida, busca os treinos atualizados da nuvem
  const res = await requisicao<Treino[]>("/treinos", "GET");

  if (res.sucesso && Array.isArray(res.dados)) {
    // Mapeia do formato do backend para o formato do app se necessário
    const remotos: Treino[] = res.dados.map((d) => ({
      id: d.id,
      nome: d.nome,
      categoria: d.categoria,
      diaSemana: d.diaSemana,
      duracaoMin: d.duracaoMin,
    }));

    // Se a nuvem retornou treinos, atualiza o cache local
    if (remotos.length > 0 || locais.length === 0) {
      await salvar(remotos);
    }
  }
}
