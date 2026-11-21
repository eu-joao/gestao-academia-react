import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Treino, listar, remover } from "../../services/treinoStorage";
import { SyncBadge } from "../../components/SyncBadge";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";

const heroImage = require("../../../assets/images/inicio_treino.jpg");
const emptyImage = require("../../../assets/images/homem_treinando_modelo.jpg");

const FILTROS_DIAS = [
  "Todos",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function TreinosListScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [busca, setBusca] = useState("");
  const [diaFiltro, setDiaFiltro] = useState("Todos");
  const [ordem, setOrdem] = useState<"padrao" | "duracao" | "nome">("padrao");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  async function carregar() {
    const dados = await listar();
    setTreinos(dados || []);
  }

  // Carrega imediatamente na montagem inicial (essencial para web)
  useEffect(() => {
    let ativo = true;
    listar().then((dados) => {
      if (ativo) setTreinos(dados || []);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Recarrega sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listar().then((dados) => {
        if (ativo) setTreinos(dados || []);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  function confirmarExclusao(treino: Treino) {
    const mensagem = `Deseja realmente remover o treino "${treino.nome}"?`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(mensagem)) {
        executarExclusao(treino.id);
      }
      return;
    }

    Alert.alert("Confirmar exclusão", mensagem, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => executarExclusao(treino.id),
      },
    ]);
  }

  async function executarExclusao(id: string) {
    await remover(id);
    setFeedbackMsg("Treino removido com sucesso.");
    setTimeout(() => setFeedbackMsg(null), 3500);
    carregar();
  }

  // RF03: Busca, Filtro e Ordenação com proteção contra valores vazios/nulos
  const treinosFiltrados = treinos
    .filter((item) => {
      const nome = (item?.nome || "").toLowerCase();
      const dia = (item?.diaSemana || "").toLowerCase();
      const atendeBusca = nome.includes(busca.trim().toLowerCase());
      const atendeDia =
        diaFiltro === "Todos" || dia === diaFiltro.toLowerCase();
      return atendeBusca && atendeDia;
    })
    .sort((a, b) => {
      if (ordem === "duracao") {
        return (b?.duracaoMin || 0) - (a?.duracaoMin || 0);
      }
      if (ordem === "nome") {
        return (a?.nome || "").localeCompare(b?.nome || "");
      }
      return 0;
    });

  const tempoTotal = treinos.reduce(
    (acc, curr) => acc + (curr?.duracaoMin || 0),
    0,
  );

  const mediaMinutos =
    treinos.length > 0 ? Math.round(tempoTotal / treinos.length) : 0;

  function alternarOrdem() {
    if (ordem === "padrao") setOrdem("duracao");
    else if (ordem === "duracao") setOrdem("nome");
    else setOrdem("padrao");
  }

  function getOrdemLabel() {
    if (ordem === "duracao") return "Duração";
    if (ordem === "nome") return "Nome A-Z";
    return "Padrão";
  }

  function renderHeroBanner() {
    return (
      <View style={styles.heroWrapper}>
        {/* Mensagem de Feedback de Exclusão (RF06) */}
        {feedbackMsg && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: colors.successLight,
                borderColor: colors.success,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.success}
            />
            <Text
              style={[styles.feedbackBannerText, { color: colors.success }]}
            >
              {feedbackMsg}
            </Text>
          </View>
        )}

        {/* Hero Banner com imagem */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={heroImage}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroTag}>
                <Ionicons name="fitness-outline" size={14} color="#38BDF8" />
                <Text style={styles.heroTagText}>ROTINA FITNESS</Text>
              </View>
              <Text style={styles.heroTitle}>Painel de Treinos</Text>
              <Text style={styles.heroSubtitle}>
                Acompanhe e organize sua programação semanal
              </Text>

              {/* Estatísticas simples */}
              <TouchableOpacity
                style={styles.statsRow}
                onPress={() => router.push("/estatisticas" as any)}
                activeOpacity={0.85}
              >
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{treinos.length}</Text>
                  <Text style={styles.statLabel}>Sessões</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{tempoTotal} min</Text>
                  <Text style={styles.statLabel}>Tempo total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{mediaMinutos} min</Text>
                  <Text style={styles.statLabel}>Média / sessão</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Image source={emptyImage} style={styles.emptyImage} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          Nenhum treino encontrado
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {busca.trim() || diaFiltro !== "Todos"
            ? "Tente ajustar a busca ou o filtro de dia para visualizar outros treinos."
            : "Você ainda não possui treinos cadastrados. Clique no botão 'Novo' para criar sua primeira sessão."}
        </Text>
        <TouchableOpacity
          style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/treinos/novo")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.emptyAddButtonText}>Cadastrar Treino</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Controles e busca fixos no topo */}
      <View
        style={[styles.fixedHeader, { backgroundColor: colors.background }]}
      >
        {/* Barra superior de navegação */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/")}
            activeOpacity={0.7}
            accessibilityLabel="Voltar ao início"
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>
              Meus Treinos
            </Text>
            <SyncBadge />
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push("/estatisticas" as any)}
              activeOpacity={0.7}
              accessibilityLabel="Estatísticas e Gráficos"
            >
              <Ionicons
                name="stats-chart-outline"
                size={17}
                color={colors.primary}
              />
            </TouchableOpacity>

            <ThemeToggle size={17} />

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/treinos/novo")}
              activeOpacity={0.8}
              accessibilityLabel="Novo treino"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RF03: Controles de Busca e Filtro */}
        <View
          style={[
            styles.controlsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Campo de Busca */}
          <View
            style={[
              styles.searchWrapper,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por nome do treino..."
              placeholderTextColor={colors.textMuted}
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Chips de filtro por dia da semana */}
          <View style={styles.chipsContainer}>
            {FILTROS_DIAS.map((dia) => {
              const ativo = diaFiltro === dia;
              return (
                <TouchableOpacity
                  key={dia}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: ativo ? colors.primary : colors.surface,
                      borderColor: ativo ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setDiaFiltro(dia)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: ativo ? "#FFFFFF" : colors.textSecondary },
                      ativo && { fontWeight: "700" },
                    ]}
                  >
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botão de Ordenação */}
          <View style={[styles.sortRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={alternarOrdem}
              activeOpacity={0.7}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.sortButtonText, { color: colors.primary }]}>
                Ordenar: {getOrdemLabel()}
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.resultsCount, { color: colors.textSecondary }]}
            >
              {treinosFiltrados.length}{" "}
              {treinosFiltrados.length === 1 ? "encontrado" : "encontrados"}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista com Hero Banner e Cards */}
      <FlatList
        data={treinosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeroBanner}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.cardClickArea}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/treinos/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.nome}
                  </Text>
                  <Text style={[styles.cardHint, { color: colors.textMuted }]}>
                    Toque para ver detalhes
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButtonEdit,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/treinos/novo",
                      params: { id: item.id },
                    })
                  }
                  activeOpacity={0.7}
                  accessibilityLabel="Editar treino"
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButtonDelete,
                    {
                      backgroundColor: colors.dangerLight,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => confirmarExclusao(item)}
                  activeOpacity={0.7}
                  accessibilityLabel="Excluir treino"
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.cardFooter, { borderTopColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/treinos/[id]",
                  params: { id: item.id },
                })
              }
            >
              {item.categoria ? (
                <View
                  style={[
                    styles.categoryTag,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={12}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.categoryTagText, { color: colors.primary }]}
                  >
                    {item.categoria}
                  </Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  {item.diaSemana}
                </Text>
              </View>

              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  {item.duracaoMin} min
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={16}
                color={colors.textMuted}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 2,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  controlsCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 12,
  },
  heroWrapper: {
    paddingTop: 4,
    marginBottom: 12,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  feedbackBannerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  heroImage: {
    width: "100%",
  },
  heroImageStyle: {
    opacity: 0.35,
  },
  heroOverlay: {
    padding: 18,
  },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
    marginBottom: 8,
    gap: 6,
  },
  heroTagText: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardClickArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardHint: {
    fontSize: 11,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  actionButtonEdit: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionButtonDelete: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    gap: 6,
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
