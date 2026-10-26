import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { listar, Treino } from "../services/treinoStorage";

const bgImage = require("../../assets/images/homem_treinando_modelo.jpg");

export default function IndexScreen() {
  const router = useRouter();
  const [totalTreinos, setTotalTreinos] = useState(0);

  useEffect(() => {
    let ativo = true;
    listar().then((lista: Treino[]) => {
      if (ativo) setTotalTreinos(lista.length);
    });
    return () => {
      ativo = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listar().then((lista: Treino[]) => {
        if (ativo) setTotalTreinos(lista.length);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={bgImage}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay}>
          {/* Top Header Tag */}
          <View style={styles.tag}>
            <Ionicons name="barbell-outline" size={16} color="#38BDF8" />
            <Text style={styles.tagText}>GESTÃO ACADEMIA</Text>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.title}>Foco, disciplina e evolução</Text>
            <Text style={styles.subtitle}>
              Organize seus treinos semanais, acompanhe a duração das sessões e
              mantenha a consistência da sua rotina.
            </Text>

            {/* Quick Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusIconBox}>
                <Ionicons name="fitness-outline" size={22} color="#0284C7" />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusValue}>{totalTreinos} treinos</Text>
                <Text style={styles.statusLabel}>
                  {totalTreinos === 0
                    ? "Comece cadastrando seu primeiro treino"
                    : "Cadastrados na sua rotina semanal"}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions Bottom */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/treinos")}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Ver Meus Treinos</Text>
              <Ionicons
                name="arrow-forward-outline"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/treinos/novo")}
              activeOpacity={0.8}
            >
              <Ionicons name="add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Cadastrar Treino</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.35,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    gap: 8,
  },
  tagText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroContent: {
    marginVertical: "auto",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
    marginBottom: 28,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    gap: 14,
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  actionsContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
