import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Treino, buscarPorId, remover } from "../../services/treinoStorage";

const detailImage = require("../../../assets/images/mulheres_treinando_modelo.jpg");

export default function TreinoDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [treino, setTreino] = useState<Treino | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarTreino = useCallback(async () => {
    if (!id) return;
    const item = await buscarPorId(id);
    setTreino(item || null);
    setCarregando(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregarTreino();
    }, [carregarTreino]),
  );

  function confirmarExclusao() {
    if (!treino) return;
    const mensagem = `Deseja realmente excluir o treino "${treino.nome}"?`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(mensagem)) {
        executarExclusao();
      }
      return;
    }

    Alert.alert("Confirmar exclusão", mensagem, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: executarExclusao,
      },
    ]);
  }

  async function executarExclusao() {
    if (!id) return;
    await remover(id);
    router.replace("/treinos/index");
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Carregando treino...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!treino) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/treinos/index")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Treino</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundTitle}>Treino não encontrado</Text>
          <Text style={styles.notFoundSubtitle}>
            Este treino pode ter sido removido ou o identificador é inválido.
          </Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => router.replace("/treinos/index")}
            activeOpacity={0.8}
          >
            <Text style={styles.backToListButtonText}>Voltar para Treinos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/treinos/index")}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Treino</Text>
        <TouchableOpacity
          style={styles.headerEditButton}
          onPress={() =>
            router.push({
              pathname: "/treinos/novo",
              params: { id: treino.id },
            })
          }
          activeOpacity={0.7}
          accessibilityLabel="Editar treino"
        >
          <Ionicons name="pencil-outline" size={18} color="#0284C7" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal */}
        <View style={styles.mainCard}>
          <Image source={detailImage} style={styles.heroImage} />

          <View style={styles.cardContent}>
            <View style={styles.badgeRow}>
              <View style={styles.activeBadge}>
                <Ionicons name="fitness-outline" size={13} color="#0284C7" />
                <Text style={styles.activeBadgeText}>ROTINA ATIVA</Text>
              </View>
            </View>

            <Text style={styles.workoutName}>{treino.nome}</Text>

            {/* Informações em grade */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#0284C7" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Dia programado</Text>
                  <Text style={styles.infoValue}>{treino.diaSemana}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="time-outline" size={20} color="#0284C7" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Duração prevista</Text>
                  <Text style={styles.infoValue}>{treino.duracaoMin} min</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Card de Recomendações */}
        <View style={styles.recommendationCard}>
          <View style={styles.recHeader}>
            <Ionicons name="checkmark-done-outline" size={18} color="#0284C7" />
            <Text style={styles.recTitle}>Orientações da sessão</Text>
          </View>
          <Text style={styles.recText}>
            Realize aquecimento articular prévio antes de iniciar as séries
            principais e mantenha a hidratação constante ao longo do treino.
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/treinos/novo",
                params: { id: treino.id },
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Informações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmarExclusao}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text style={styles.deleteButtonText}>Excluir Treino</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerEditButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  backToListButton: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backToListButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: 0.8,
  },
  workoutName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
    lineHeight: 28,
  },
  infoGrid: {
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  recText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },
  actionButtonsContainer: {
    gap: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
});
