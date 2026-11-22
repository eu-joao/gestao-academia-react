import * as Notifications from "expo-notifications";
import {
  AndroidImportance,
  AndroidNotificationPriority,
} from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

const STORAGE_KEY_LEMBRETE = "@academia:lembrete_treino";

// Configuração de exibição em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: AndroidNotificationPriority.HIGH,
  }),
});

export interface ConfigLembrete {
  ativo: boolean;
  hora: number;
  minuto: number;
}

export async function obterConfigLembrete(): Promise<ConfigLembrete> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LEMBRETE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return { ativo: false, hora: 8, minuto: 0 };
}

export async function salvarConfigLembrete(
  config: ConfigLembrete,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_LEMBRETE, JSON.stringify(config));
}

export async function solicitarPermissoes(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permissão necessária",
      "Habilite as permissões de notificação nas configurações do aparelho para receber lembretes de treino.",
    );
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lembretes-treino", {
      name: "Lembretes de Treino",
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
    });
  }

  return true;
}

export async function agendarLembreteDiario(
  hora: number,
  minuto: number,
): Promise<boolean> {
  const permitiu = await solicitarPermissoes();
  if (!permitiu) return false;

  try {
    // Cancela lembretes antigos antes de agendar o novo
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora do Treino! 💪",
        body: "Confira o seu treino de hoje no aplicativo e mantenha o foco!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hora,
        minute: minuto,
        channelId: Platform.OS === "android" ? "lembretes-treino" : undefined,
      },
    });

    await salvarConfigLembrete({ ativo: true, hora, minuto });
    return true;
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
    Alert.alert("Erro", "Não foi possível agendar o lembrete.");
    return false;
  }
}

export async function desativarLembreteDiario(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const config = await obterConfigLembrete();
    await salvarConfigLembrete({ ...config, ativo: false });
  } catch (error) {
    console.error("Erro ao cancelar lembretes:", error);
  }
}

export async function dispararNotificacaoImediata(
  titulo: string,
  mensagem: string,
): Promise<void> {
  const permitiu = await solicitarPermissoes();
  if (!permitiu) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: mensagem,
      sound: true,
    },
    trigger: null, // Disparo imediato
  });
}
