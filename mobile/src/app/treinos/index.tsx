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
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Treino, listar, remover } from "../../services/treinoStorage";

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
          <View style={styles.feedbackBanner}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#16A34A"
            />
            <Text style={styles.feedbackBannerText}>{feedbackMsg}</Text>
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

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{treinos.length}</Text>
                  <Text style={styles.statLabel}>Total cadastrado</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{tempoTotal} min</Text>
                  <Text style={styles.statLabel}>Tempo total</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Image source={emptyImage} style={styles.emptyImage} />
        <Text style={styles.emptyTitle}>Nenhum treino encontrado</Text>
        <Text style={styles.emptySubtitle}>
          {busca.trim() || diaFiltro !== "Todos"
            ? "Tente ajustar a busca ou o filtro de dia para visualizar outros treinos."
            : "Você ainda não possui treinos cadastrados. Clique no botão 'Novo' para criar sua primeira sessão."}
        </Text>
        <TouchableOpacity
          style={styles.emptyAddButton}
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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Controles e busca fixos no topo para garantir foco ininterrupto na digitação */}
      <View style={styles.fixedHeader}>
        {/* Barra superior de navegação */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
            activeOpacity={0.7}
            accessibilityLabel="Voltar ao início"
          >
            <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Meus Treinos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/treinos/novo")}
            activeOpacity={0.8}
            accessibilityLabel="Novo treino"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {/* RF03: Controles de Busca e Filtro */}
        <View style={styles.controlsCard}>
          {/* Campo de Busca */}
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#64748B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome do treino..."
              placeholderTextColor="#94A3B8"
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
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
                  style={[styles.chip, ativo && styles.chipActive]}
                  onPress={() => setDiaFiltro(dia)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.chipText, ativo && styles.chipTextActive]}
                  >
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botão de Ordenação */}
          <View style={styles.sortRow}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={alternarOrdem}
              activeOpacity={0.7}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={16}
                color="#0284C7"
              />
              <Text style={styles.sortButtonText}>
                Ordenar: {getOrdemLabel()}
              </Text>
            </TouchableOpacity>

            <Text style={styles.resultsCount}>
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
          <View style={styles.card}>
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
                <View style={styles.cardIconBox}>
                  <Ionicons name="barbell-outline" size={18} color="#0284C7" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={styles.cardHint}>Toque para ver detalhes</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButtonEdit}
                  onPress={() =>
                    router.push({
                      pathname: "/treinos/novo",
                      params: { id: item.id },
                    })
                  }
                  activeOpacity={0.7}
                  accessibilityLabel="Editar treino"
                >
                  <Ionicons name="pencil-outline" size={16} color="#0284C7" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonDelete}
                  onPress={() => confirmarExclusao(item)}
                  activeOpacity={0.7}
                  accessibilityLabel="Excluir treino"
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cardFooter}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/treinos/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.tag}>
                <Ionicons name="calendar-outline" size={13} color="#475569" />
                <Text style={styles.tagText}>{item.diaSemana}</Text>
              </View>

              <View style={styles.tag}>
                <Ionicons name="time-outline" size={13} color="#475569" />
                <Text style={styles.tagText}>{item.duracaoMin} min</Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={16}
                color="#CBD5E1"
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
    backgroundColor: "#F8FAFC",
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 2,
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
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  controlsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: "#0F172A",
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
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284C7",
  },
  resultsCount: {
    fontSize: 12,
    color: "#64748B",
  },
  heroWrapper: {
    paddingTop: 4,
    marginBottom: 12,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  feedbackBannerText: {
    color: "#166534",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#E0F2FE",
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
    color: "#0F172A",
  },
  cardHint: {
    fontSize: 11,
    color: "#94A3B8",
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
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  actionButtonDelete: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    color: "#0F172A",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284C7",
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
