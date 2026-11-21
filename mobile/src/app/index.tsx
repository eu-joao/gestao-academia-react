import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { listar, Treino } from "../services/treinoStorage";
import { SyncBadge } from "../components/SyncBadge";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import {
  obterNomeDiaSemanaAtual,
  obterTreinosDeHoje,
} from "../utils/estatisticas";

const bgImage = require("../../assets/images/homem_treinando_modelo.jpg");

export default function IndexScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [totalTreinos, setTotalTreinos] = useState(0);

  const carregar = useCallback(async () => {
    const lista = await listar();
    setTreinos(lista || []);
    setTotalTreinos((lista || []).length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const diaHoje = obterNomeDiaSemanaAtual();
  const treinosHoje = obterTreinosDeHoje(treinos);
  const temTreinoHoje = treinosHoje.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Tag com Badge de Sincronização e ThemeToggle */}
        <View style={styles.topHeaderRow}>
          <View
            style={[
              styles.tag,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="barbell-outline" size={16} color={colors.primary} />
            <Text style={[styles.tagText, { color: colors.primary }]}>
              GESTÃO ACADEMIA
            </Text>
          </View>
          <View style={styles.topActionsRow}>
            <SyncBadge />
            <ThemeToggle size={18} />
          </View>
        </View>

        {/* Hero Banner Card Contido */}
        <View
          style={[
            styles.heroCard,
            {
              borderColor: isDark ? colors.border : "transparent",
            },
          ]}
        >
          <ImageBackground
            source={bgImage}
            style={styles.heroBannerImage}
            imageStyle={styles.heroBannerImageStyle}
          >
            <View style={styles.heroBannerOverlay}>
              <View style={styles.heroBannerTag}>
                <Ionicons name="sparkles-outline" size={12} color="#38BDF8" />
                <Text style={styles.heroBannerTagText}>FOCO & DISCIPLINA</Text>
              </View>
              <Text style={styles.heroBannerTitle}>
                Foco, disciplina e evolução
              </Text>
              <Text style={styles.heroBannerSubtitle}>
                Organize seus treinos semanais, acompanhe suas estatísticas e
                mantenha a consistência da sua rotina.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Seção de Cards Temáticos */}
        <View style={styles.cardsSection}>
          {/* Card Dinâmico: Treino de Hoje (Lembrete Inteligente) */}
          <View
            style={[
              styles.todayCard,
              {
                backgroundColor: colors.card,
                borderColor: temTreinoHoje ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.todayHeaderRow}>
              <View style={styles.todayBadge}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={temTreinoHoje ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.todayBadgeText,
                    {
                      color: temTreinoHoje
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  HOJE: {diaHoje.toUpperCase()}
                </Text>
              </View>
              {temTreinoHoje && (
                <View
                  style={[
                    styles.todayDurationBadge,
                    { backgroundColor: colors.warningLight },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={colors.warning}
                  />
                  <Text
                    style={[
                      styles.todayDurationText,
                      { color: colors.warning },
                    ]}
                  >
                    {treinosHoje[0].duracaoMin} min
                  </Text>
                </View>
              )}
            </View>

            {temTreinoHoje ? (
              <View style={styles.todayBody}>
                <Text
                  style={[
                    styles.todayWorkoutName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {treinosHoje[0].nome}
                </Text>
                <Text
                  style={[
                    styles.todayWorkoutMeta,
                    { color: colors.textSecondary },
                  ]}
                >
                  Categoria: {treinosHoje[0].categoria}
                  {treinosHoje.length > 1 &&
                    ` (+${treinosHoje.length - 1} outro(s) treino(s))`}
                </Text>
                <TouchableOpacity
                  style={styles.todayActionButton}
                  onPress={() => router.push(`/treinos/${treinosHoje[0].id}`)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.todayActionButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Ver Detalhes do Treino
                  </Text>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={14}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.todayBody}>
                <Text
                  style={[styles.todayRestTitle, { color: colors.textPrimary }]}
                >
                  Dia de Descanso / Recuperação
                </Text>
                <Text
                  style={[
                    styles.todayRestSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Nenhum treino agendado para hoje. Aproveite para descansar ou
                  fazer uma caminhada leve!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Status Card com Atalho para Estatísticas */}
          <TouchableOpacity
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/estatisticas" as any)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.statusIconBox,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name="stats-chart-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
                {totalTreinos} treinos cadastrados
              </Text>
              <Text
                style={[styles.statusLabel, { color: colors.textSecondary }]}
              >
                Toque para ver gráficos, volume e relatórios
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Actions Bottom */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            onPress={() => router.push("/treinos")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Ver Meus Treinos</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/estatisticas" as any)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pie-chart-outline"
                size={17}
                color={colors.textPrimary}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                Estatísticas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/treinos/novo")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add-outline"
                size={18}
                color={colors.textPrimary}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                Novo Treino
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    backgroundColor: "#0F172A",
  },
  heroBannerImage: {
    width: "100%",
  },
  heroBannerImageStyle: {
    resizeMode: "cover",
  },
  heroBannerOverlay: {
    padding: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(15, 23, 42, 0.70)",
    gap: 10,
  },
  heroBannerTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(2, 132, 199, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
    gap: 5,
  },
  heroBannerTagText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 30,
  },
  heroBannerSubtitle: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 18,
  },
  cardsSection: {
    gap: 12,
  },
  todayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  todayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  todayDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  todayDurationText: {
    fontSize: 11,
    fontWeight: "700",
  },
  todayBody: {
    gap: 4,
  },
  todayWorkoutName: {
    fontSize: 18,
    fontWeight: "700",
  },
  todayWorkoutMeta: {
    fontSize: 13,
  },
  todayActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  todayActionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  todayRestTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  todayRestSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  actionsContainer: {
    gap: 10,
    marginTop: "auto",
    paddingTop: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
