import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  adicionarOuvinteStatus,
  processarFila,
  StatusSincronizacao,
} from "../services/syncQueue";
import { useTheme } from "../contexts/ThemeContext";

export function SyncBadge() {
  const { isDark } = useTheme();
  const [status, setStatus] = useState<StatusSincronizacao>("sincronizado");
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    const removerOuvinte = adicionarOuvinteStatus((novoStatus, qtd) => {
      setStatus(novoStatus);
      setPendentes(qtd);
    });
    return removerOuvinte;
  }, []);

  function handlePress() {
    processarFila();
  }

  if (status === "sincronizado" && pendentes === 0) {
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
        Offline ({pendentes} {pendentes === 1 ? "pendente" : "pendentes"})
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
