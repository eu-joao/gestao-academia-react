import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { obterTreinos, Treino } from "../services/treinoStorage";
import {
  calcularEstatisticas,
  obterNomeDiaSemanaAtual,
  ResumoEstatisticas,
} from "../utils/estatisticas";
import {
  exportarRelatorioTexto,
  exportarBackupJSON,
} from "../utils/exportarTreinos";
import {
  agendarLembreteDiario,
  desativarLembreteDiario,
  dispararNotificacaoImediata,
  obterConfigLembrete,
} from "../services/notificacoes";

export default function EstatisticasScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [carregando, setCarregando] = useState(true);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [stats, setStats] = useState<ResumoEstatisticas | null>(null);

  // Lembretes
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [horaLembrete, setHoraLembrete] = useState(8);

  const carregarDados = useCallback(async () => {
    try {
      const lista = await obterTreinos();
      setTreinos(lista);
      setStats(calcularEstatisticas(lista));

      const configLembrete = await obterConfigLembrete();
      setLembreteAtivo(configLembrete.ativo);
      setHoraLembrete(configLembrete.hora);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const diaAtualNome = obterNomeDiaSemanaAtual();

  async function handleToggleLembrete(ativo: boolean) {
    if (ativo) {
      const sucesso = await agendarLembreteDiario(horaLembrete, 0);
      if (sucesso) {
        setLembreteAtivo(true);
        Alert.alert(
          "Lembrete Ativado",
          `Você receberá um lembrete diário de treino às ${String(horaLembrete).padStart(2, "0")}:00.`,
        );
      }
    } else {
      await desativarLembreteDiario();
      setLembreteAtivo(false);
      Alert.alert(
        "Lembrete Desativado",
        "Os lembretes diários foram desativados.",
      );
    }
  }

  async function handleAlterarHora(novaHora: number) {
    setHoraLembrete(novaHora);
    if (lembreteAtivo) {
      await agendarLembreteDiario(novaHora, 0);
      Alert.alert(
        "Horário Atualizado",
        `Lembrete reagendado para as ${String(novaHora).padStart(2, "0")}:00.`,
      );
    }
  }

  async function handleTestarNotificacao() {
    await dispararNotificacaoImediata(
      "Hora do Treino! 💪",
      `Hoje é ${diaAtualNome}! Mantenha sua constância na academia.`,
    );
  }

  if (carregando) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Calculando estatísticas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const mediaMinutos =
    stats && stats.totalTreinos > 0
      ? Math.round(stats.totalMinutosSemana / stats.totalTreinos)
      : 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Estatísticas
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Desempenho semanal e relatórios
            </Text>
          </View>

          <ThemeToggle />
        </View>

        {/* Cards de Métricas Principais (Grid 2x2) */}
        <View style={styles.metricsGrid}>
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricIconRow}>
              <View
                style={[
                  styles.metricIconBg,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="barbell-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[styles.metricLabel, { color: colors.textSecondary }]}
              >
                Treinos
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {stats?.totalTreinos || 0}
            </Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              ativos na rotina
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricIconRow}>
              <View
                style={[
                  styles.metricIconBg,
                  { backgroundColor: colors.warningLight },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.warning}
                />
              </View>
              <Text
                style={[styles.metricLabel, { color: colors.textSecondary }]}
              >
                Tempo Total
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {stats?.totalMinutosSemana || 0}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              estimado por semana
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricIconRow}>
              <View
                style={[
                  styles.metricIconBg,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color={colors.success}
                />
              </View>
              <Text
                style={[styles.metricLabel, { color: colors.textSecondary }]}
              >
                Média / Treino
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {mediaMinutos}
              <Text style={styles.metricUnit}> min</Text>
            </Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              duração média
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.metricIconRow}>
              <View
                style={[
                  styles.metricIconBg,
                  {
                    backgroundColor: isDark
                      ? "rgba(168, 85, 247, 0.15)"
                      : "#F3E8FF",
                  },
                ]}
              >
                <Ionicons name="ribbon-outline" size={18} color="#A855F7" />
              </View>
              <Text
                style={[styles.metricLabel, { color: colors.textSecondary }]}
              >
                Foco Principal
              </Text>
            </View>
            <Text
              style={[styles.metricValueSmall, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {stats?.categoriaFavorita || "Geral"}
            </Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              categoria favorita
            </Text>
          </View>
        </View>

        {/* Gráfico de Barras: Volume de Treino por Dia da Semana */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Volume por Dia da Semana
              </Text>
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Duração estimada de treino (minutos)
              </Text>
            </View>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.chartContainer}>
            {stats?.minutosPorDia.map((item) => {
              const alturaPorcentagem =
                stats.maiorMinutosDia > 0
                  ? Math.max((item.minutos / stats.maiorMinutosDia) * 100, 6)
                  : 6;

              const ehHoje =
                item.dia.toLowerCase() === diaAtualNome.toLowerCase();

              return (
                <View key={item.dia} style={styles.barCol}>
                  <Text
                    style={[
                      styles.barValueText,
                      {
                        color:
                          item.minutos > 0
                            ? colors.textPrimary
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {item.minutos > 0 ? `${item.minutos}` : "-"}
                  </Text>

                  <View
                    style={[
                      styles.barTrack,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${alturaPorcentagem}%`,
                          backgroundColor: ehHoje
                            ? colors.primary
                            : item.minutos > 0
                              ? isDark
                                ? "#334155"
                                : "#94A3B8"
                              : "transparent",
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.barLabelText,
                      {
                        color: ehHoje ? colors.primary : colors.textSecondary,
                        fontWeight: ehHoje ? "700" : "500",
                      },
                    ]}
                  >
                    {item.sigla}
                  </Text>
                  {ehHoje && (
                    <View
                      style={[
                        styles.todayDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Distribuição por Categoria */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Distribuição por Categoria
              </Text>
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Proporção dos tipos de treino cadastrados
              </Text>
            </View>
            <Ionicons
              name="pie-chart-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          {stats?.distribuicaoCategorias.length === 0 ? (
            <Text
              style={[styles.emptySectionText, { color: colors.textMuted }]}
            >
              Nenhum treino disponível para calcular categorias.
            </Text>
          ) : (
            stats?.distribuicaoCategorias.map((cat, index) => (
              <View key={cat.categoria} style={styles.catProgressRow}>
                <View style={styles.catLabelRow}>
                  <Text
                    style={[styles.catNameText, { color: colors.textPrimary }]}
                  >
                    {cat.categoria}
                  </Text>
                  <Text
                    style={[
                      styles.catCountText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {cat.qtd} {cat.qtd === 1 ? "treino" : "treinos"} (
                    {cat.porcentagem}%)
                  </Text>
                </View>

                <View
                  style={[
                    styles.catTrack,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.catFill,
                      {
                        width: `${cat.porcentagem}%`,
                        backgroundColor:
                          index === 0
                            ? colors.primary
                            : index === 1
                              ? colors.warning
                              : index === 2
                                ? colors.success
                                : "#A855F7",
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Lembretes e Notificações Locais */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Lembrete Diário de Treino
              </Text>
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Receba uma notificação no celular para não perder a rotina
              </Text>
            </View>
            <Switch
              value={lembreteAtivo}
              onValueChange={handleToggleLembrete}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={lembreteAtivo ? colors.primary : colors.textMuted}
            />
          </View>

          {lembreteAtivo && (
            <View style={styles.reminderOptionsContainer}>
              <Text
                style={[
                  styles.reminderSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Horário do lembrete:
              </Text>
              <View style={styles.hoursRow}>
                {[6, 7, 8, 12, 18, 19, 20].map((h) => {
                  const selecionado = horaLembrete === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.hourPill,
                        {
                          backgroundColor: selecionado
                            ? colors.primary
                            : isDark
                              ? "#1E293B"
                              : "#F1F5F9",
                          borderColor: selecionado
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => handleAlterarHora(h)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.hourPillText,
                          {
                            color: selecionado ? "#FFFFFF" : colors.textPrimary,
                            fontWeight: selecionado ? "700" : "500",
                          },
                        ]}
                      >
                        {String(h).padStart(2, "0")}:00
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.testNotificationButton,
              { borderColor: colors.border },
            ]}
            onPress={handleTestarNotificacao}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={16}
              color={colors.primary}
            />
            <Text
              style={[styles.testNotificationText, { color: colors.primary }]}
            >
              Testar Notificação Agora
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exportação de Dados */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                Exportação de Dados
              </Text>
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Compartilhe sua ficha ou faça backup dos seus treinos
              </Text>
            </View>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.exportButtonsRow}>
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: colors.primary }]}
              onPress={() => exportarRelatorioTexto(treinos)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.exportButtonText}>
                Ficha de Treino (Texto)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.exportButtonSecondary,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => exportarBackupJSON(treinos)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="code-download-outline"
                size={18}
                color={colors.textPrimary}
              />
              <Text
                style={[
                  styles.exportButtonSecondaryText,
                  { color: colors.textPrimary },
                ]}
              >
                Backup JSON
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "46%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metricIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  metricValueSmall: {
    fontSize: 17,
    fontWeight: "800",
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: "500",
  },
  metricSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionDescription: {
    fontSize: 12,
    marginTop: 1,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    paddingTop: 16,
    paddingBottom: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barValueText: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    borderRadius: 7,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 7,
  },
  barLabelText: {
    fontSize: 11,
    marginTop: 6,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  emptySectionText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  catProgressRow: {
    gap: 6,
  },
  catLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catNameText: {
    fontSize: 13,
    fontWeight: "600",
  },
  catCountText: {
    fontSize: 12,
  },
  catTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  catFill: {
    height: "100%",
    borderRadius: 4,
  },
  reminderOptionsContainer: {
    gap: 8,
    paddingTop: 4,
  },
  reminderSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  hoursRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  hourPillText: {
    fontSize: 12,
  },
  testNotificationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  testNotificationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  exportButtonsRow: {
    gap: 10,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exportButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  exportButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
