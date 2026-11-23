import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";

// Endereço base da API Spring Boot
// - Na Web: localhost direto
// - No Android Emulator oficial: 10.0.2.2 aponta para o localhost da máquina hospedeira
// - Em dispositivo físico / Expo Go: IP dinâmico obtido do Metro Bundler ou IP local de fallback
const API_PORT = "8080";
const IP_FALLBACK = "192.168.1.4";

function extrairIpMetro(): string | null {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (
        Constants as unknown as {
          manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
        }
      )?.manifest2?.extra?.expoClient?.hostUri ||
      (Constants as unknown as { manifest?: { debuggerHost?: string } })
        ?.manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        return ip;
      }
    }
  } catch {}
  return null;
}

export function obterBaseUrl(): string {
  if (Platform.OS === "web") {
    return `http://localhost:${API_PORT}`;
  }

  // Emulador oficial Android (BlueStacks ou AVD)
  if (Platform.OS === "android" && !Device.isDevice) {
    return `http://10.0.2.2:${API_PORT}`;
  }

  // Dispositivo físico (Expo Go no celular Android ou iOS)
  const hostIp = extrairIpMetro();
  const ipFinal = hostIp || IP_FALLBACK;
  return `http://${ipFinal}:${API_PORT}`;
}

export const BASE_URL = obterBaseUrl();

export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  status: number;
  erro?: string;
}

let modoOfflineSimulado = false;

export function definirModoOfflineSimulado(ativo: boolean): void {
  modoOfflineSimulado = ativo;
}

export function obterModoOfflineSimulado(): boolean {
  return modoOfflineSimulado;
}

export async function testarConexao(): Promise<boolean> {
  if (modoOfflineSimulado) {
    return false;
  }
  const baseUrl = obterBaseUrl();
  const url = `${baseUrl}/treinos`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resposta = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return resposta.ok || resposta.status === 200;
  } catch {
    return false;
  }
}

export async function requisicao<T>(
  endpoint: string,
  metodo: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  corpo?: unknown,
  token?: string,
): Promise<RespostaApi<T>> {
  if (modoOfflineSimulado) {
    return {
      sucesso: false,
      status: 0,
      erro: "Modo offline ativo (simulação)",
    };
  }

  const baseUrl = obterBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (corpo) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (__DEV__) {
    console.log(`[API ${metodo}] Conectando em: ${url}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de timeout

    const resposta = await fetch(url, {
      method: metodo,
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (resposta.status === 204) {
      return { sucesso: true, status: 204 };
    }

    const contentType = resposta.headers.get("content-type");
    let dados: T | undefined;

    if (contentType && contentType.includes("application/json")) {
      dados = await resposta.json();
    }

    if (resposta.ok) {
      return { sucesso: true, dados, status: resposta.status };
    }

    return {
      sucesso: false,
      dados,
      status: resposta.status,
      erro: `Erro ${resposta.status}: ${resposta.statusText}`,
    };
  } catch (err: unknown) {
    const mensagem =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Tempo limite de conexão esgotado (timeout)"
          : err.message
        : "Erro de rede desconhecido";

    if (__DEV__) {
      console.warn(
        `[API Falha] Não foi possível conectar em ${url}: ${mensagem}`,
      );
    }

    return {
      sucesso: false,
      status: 0,
      erro: mensagem,
    };
  }
}
