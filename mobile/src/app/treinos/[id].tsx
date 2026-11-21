import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Treino, buscarPorId, remover } from "../../services/treinoStorage";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeToggle } from "../../components/ThemeToggle";

const detailImage = require("../../../assets/images/inicio_treino.jpg");

export default function TreinoDetalheScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
    router.replace("/treinos");
  }

  if (carregando) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando treino...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!treino) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.replace("/treinos")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Detalhes do Treino
          </Text>
          <ThemeToggle size={18} />
        </View>

        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>
            Treino não encontrado
          </Text>
          <Text
            style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}
          >
            Este treino pode ter sido removido ou o identificador é inválido.
          </Text>
          <TouchableOpacity
            style={[
              styles.backToListButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => router.replace("/treinos")}
            activeOpacity={0.8}
          >
            <Text style={styles.backToListButtonText}>Voltar para Treinos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.replace("/treinos")}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back-outline"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Detalhes do Treino
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            style={[
              styles.headerEditButton,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/treinos/novo",
                params: { id: treino.id },
              })
            }
            activeOpacity={0.7}
            accessibilityLabel="Editar treino"
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <ThemeToggle size={18} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal */}
        <View
          style={[
            styles.mainCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Image source={detailImage} style={styles.heroImage} />

          <View style={styles.cardContent}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="fitness-outline"
                  size={13}
                  color={colors.primary}
                />
                <Text
                  style={[styles.activeBadgeText, { color: colors.primary }]}
                >
                  {treino.categoria
                    ? treino.categoria.toUpperCase()
                    : "ROTINA ATIVA"}
                </Text>
              </View>
            </View>

            <Text style={[styles.workoutName, { color: colors.textPrimary }]}>
              {treino.nome}
            </Text>

            {/* Informações em grade */}
            <View style={styles.infoGrid}>
              {treino.categoria ? (
                <View style={styles.infoItem}>
                  <View
                    style={[
                      styles.infoIconBox,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Categoria do treino
                    </Text>
                    <Text
                      style={[styles.infoValue, { color: colors.textPrimary }]}
                    >
                      {treino.categoria}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoIconBox,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Dia programado
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                  >
                    {treino.diaSemana}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoIconBox,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Duração prevista
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.textPrimary }]}
                  >
                    {treino.duracaoMin} min
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Card de Recomendações */}
        <View
          style={[
            styles.recommendationCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.recHeader}>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.recTitle, { color: colors.textPrimary }]}>
              Orientações da sessão
            </Text>
          </View>
          <Text style={[styles.recText, { color: colors.textSecondary }]}>
            Realize aquecimento articular prévio antes de iniciar as séries
            principais e mantenha a hidratação constante ao longo do treino.
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
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
            style={[
              styles.deleteButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.danger,
              },
            ]}
            onPress={confirmarExclusao}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
              Excluir Treino
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerEditButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  notFoundSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  backToListButton: {
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
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  recommendationCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  },
  recText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    gap: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
