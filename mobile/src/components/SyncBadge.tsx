import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  adicionarOuvinteStatus,
  verificarConexaoAtiva,
  iniciarMonitorConexao,
  alternarModoOfflineSimulado,
  estaEmModoOfflineSimulado,
  StatusSincronizacao,
} from "../services/syncQueue";
import { useTheme } from "../contexts/ThemeContext";

export function SyncBadge() {
  const { isDark } = useTheme();
  const [status, setStatus] = useState<StatusSincronizacao>("sincronizado");
  const [pendentes, setPendentes] = useState(0);
  const [simulado, setSimulado] = useState(false);

  useEffect(() => {
    const pararMonitor = iniciarMonitorConexao();
    const removerOuvinte = adicionarOuvinteStatus((novoStatus, qtd) => {
      setStatus(novoStatus);
      setPendentes(qtd);
      setSimulado(estaEmModoOfflineSimulado());
    });
    return () => {
      removerOuvinte();
      pararMonitor();
    };
  }, []);

  function handlePress() {
    verificarConexaoAtiva();
  }

  function handleLongPress() {
    alternarModoOfflineSimulado().then((ativo) => {
      setSimulado(ativo);
      Alert.alert(
        ativo ? "Modo Offline Ativado" : "Modo Online Restaurado",
        ativo
          ? "O app agora está em modo offline simulado. As alterações ficarão pendentes no aparelho sem tentar enviar à nuvem (ideal para demonstração sem risco ao Expo Go)."
          : "O app voltou a se conectar normalmente com a nuvem e processará a fila.",
      );
    });
  }

  if (status === "sincronizado" && pendentes === 0 && !simulado) {
    return (
      <TouchableOpacity
        style={[
          styles.badge,
          isDark
            ? {
                backgroundColor: "rgba(22, 163, 74, 0.15)",
                borderColor: "#166534",
              }
            : styles.badgeSynced,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={1000}
        activeOpacity={0.7}
      >
        <Ionicons
          name="cloud-done-outline"
          size={13}
          color={isDark ? "#4ADE80" : "#16A34A"}
        />
        <Text
          style={[
            styles.text,
            isDark ? { color: "#4ADE80" } : styles.textSynced,
          ]}
        >
          Nuvem sincronizada
        </Text>
      </TouchableOpacity>
    );
  }

  if (status === "sincronizando") {
    return (
      <View
        style={[
          styles.badge,
          isDark
            ? {
                backgroundColor: "rgba(2, 132, 199, 0.15)",
                borderColor: "#0369A1",
              }
            : styles.badgeSyncing,
        ]}
      >
        <Ionicons
          name="sync-outline"
          size={13}
          color={isDark ? "#38BDF8" : "#0284C7"}
        />
        <Text
          style={[
            styles.text,
            isDark ? { color: "#38BDF8" } : styles.textSyncing,
          ]}
        >
          Sincronizando ({pendentes})...
        </Text>
      </View>
    );
  }

  const textoOffline = simulado
    ? `Offline simulado (${pendentes})`
    : pendentes === 0
      ? "Offline (sem rede)"
      : `Offline (${pendentes} ${pendentes === 1 ? "pendente" : "pendentes"})`;

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        isDark
          ? {
              backgroundColor: "rgba(217, 119, 6, 0.15)",
              borderColor: "#92400E",
            }
          : styles.badgeOffline,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={1000}
      activeOpacity={0.7}
    >
      <Ionicons
        name="cloud-offline-outline"
        size={13}
        color={isDark ? "#FBBF24" : "#D97706"}
      />
      <Text
        style={[
          styles.text,
          isDark ? { color: "#FBBF24" } : styles.textOffline,
        ]}
      >
        {textoOffline}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  badgeSynced: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  badgeSyncing: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  badgeOffline: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
  textSynced: {
    color: "#166534",
  },
  textSyncing: {
    color: "#0369A1",
  },
  textOffline: {
    color: "#B45309",
  },
});
