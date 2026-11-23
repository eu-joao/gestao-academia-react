import asyncStorage from "@react-native-async-storage/async-storage";
import {
  requisicao,
  testarConexao,
  definirModoOfflineSimulado,
  obterModoOfflineSimulado,
} from "./api";

const FILA_KEY = "@academia:fila_sync";

export type AcaoSync = "CREATE" | "UPDATE" | "DELETE";

export interface ItemFilaSync {
  id: string;
  acao: AcaoSync;
  resourceId: string;
  payload?: unknown;
  timestamp: number;
  tentativas: number;
}

export type StatusSincronizacao = "sincronizado" | "sincronizando" | "offline";

type OuvinteStatus = (status: StatusSincronizacao, pendentes: number) => void;

let processando = false;
const ouvintes: Set<OuvinteStatus> = new Set();
let statusAtual: StatusSincronizacao = "sincronizado";

export function adicionarOuvinteStatus(ouvinte: OuvinteStatus): () => void {
  ouvintes.add(ouvinte);
  obterItensFila().then((itens) => {
    ouvinte(statusAtual, itens.length);
  });
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function notificar(novoStatus: StatusSincronizacao, pendentes: number) {
  statusAtual = novoStatus;
  ouvintes.forEach((cb) => {
    try {
      cb(novoStatus, pendentes);
    } catch {
      // ignora erro em ouvinte
    }
  });
}

export async function obterItensFila(): Promise<ItemFilaSync[]> {
  try {
    const raw = await asyncStorage.getItem(FILA_KEY);
    return raw ? (JSON.parse(raw) as ItemFilaSync[]) : [];
  } catch {
    return [];
  }
}

async function salvarItensFila(itens: ItemFilaSync[]): Promise<void> {
  await asyncStorage.setItem(FILA_KEY, JSON.stringify(itens));
}

export async function enfileirar(
  acao: AcaoSync,
  resourceId: string,
  payload?: unknown,
): Promise<void> {
  const fila = await obterItensFila();

  // Otimização de fila inteligente:
  // Se o recurso já tem uma ação pendente, agrupa para evitar requisições redundantes
  const indexExistente = fila.findIndex(
    (item) => item.resourceId === resourceId,
  );

  if (indexExistente !== -1) {
    const anterior = fila[indexExistente];

    if (anterior.acao === "CREATE" && acao === "UPDATE") {
      fila[indexExistente] = {
        ...anterior,
        payload: { ...(anterior.payload as object), ...(payload as object) },
        timestamp: Date.now(),
      };
    } else if (anterior.acao === "CREATE" && acao === "DELETE") {
      // Se acabou de ser criado offline e já foi excluído antes de subir, remove da fila
      fila.splice(indexExistente, 1);
    } else {
      fila[indexExistente] = {
        ...anterior,
        acao,
        payload,
        timestamp: Date.now(),
      };
    }
  } else {
    fila.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      acao,
      resourceId,
      payload,
      timestamp: Date.now(),
      tentativas: 0,
    });
  }

  await salvarItensFila(fila);
  notificar("offline", fila.length);

  // Tenta processar em segundo plano
  processarFila();
}

export async function processarFila(): Promise<void> {
  if (processando) return;
  processando = true;

  try {
    const fila = await obterItensFila();

    if (fila.length === 0) {
      notificar("sincronizado", 0);
      processando = false;
      return;
    }

    notificar("sincronizando", fila.length);

    while (fila.length > 0) {
      const item = fila[0];
      let sucesso = false;

      if (item.acao === "CREATE") {
        const res = await requisicao("/treinos", "POST", item.payload);
        sucesso = res.sucesso || res.status === 409; // 409 conflito significa que já foi criado
        if (!sucesso && res.status === 0) break; // Sem internet
      } else if (item.acao === "UPDATE") {
        const res = await requisicao(
          `/treinos/${item.resourceId}`,
          "PUT",
          item.payload,
        );
        sucesso = res.sucesso || res.status === 404; // Se já não existe, considera resolvido
        if (!sucesso && res.status === 0) break; // Sem internet
      } else if (item.acao === "DELETE") {
        const res = await requisicao(`/treinos/${item.resourceId}`, "DELETE");
        sucesso = res.sucesso || res.status === 404; // Se já foi removido, ok
        if (!sucesso && res.status === 0) break; // Sem internet
      }

      if (sucesso) {
        fila.shift(); // Remove o primeiro item processado com sucesso
        await salvarItensFila(fila);
        notificar(
          fila.length > 0 ? "sincronizando" : "sincronizado",
          fila.length,
        );
      } else {
        // Falha transitória de rede: interrompe e mantém a ordem FIFO
        item.tentativas += 1;
        await salvarItensFila(fila);
        notificar("offline", fila.length);
        break;
      }
    }
  } catch {
    // Se ocorrer exceção de rede, notifica estado offline
    const restante = await obterItensFila();
    notificar("offline", restante.length);
  } finally {
    processando = false;
  }
}

export async function verificarConexaoAtiva(): Promise<boolean> {
  const online = await testarConexao();
  const fila = await obterItensFila();

  if (online) {
    if (fila.length > 0) {
      processarFila();
    } else {
      notificar("sincronizado", 0);
    }
  } else {
    notificar("offline", fila.length);
  }

  return online;
}

export async function alternarModoOfflineSimulado(): Promise<boolean> {
  const novoEstado = !obterModoOfflineSimulado();
  definirModoOfflineSimulado(novoEstado);
  await verificarConexaoAtiva();
  return novoEstado;
}

export function estaEmModoOfflineSimulado(): boolean {
  return obterModoOfflineSimulado();
}

let intervaloHeartbeat: ReturnType<typeof setInterval> | null = null;
let contagemAtivos = 0;

export function iniciarMonitorConexao(): () => void {
  contagemAtivos += 1;
  verificarConexaoAtiva();

  if (!intervaloHeartbeat) {
    intervaloHeartbeat = setInterval(() => {
      verificarConexaoAtiva();
    }, 8000);
  }

  return () => {
    contagemAtivos = Math.max(0, contagemAtivos - 1);
    if (contagemAtivos === 0 && intervaloHeartbeat) {
      clearInterval(intervaloHeartbeat);
      intervaloHeartbeat = null;
    }
  };
}
