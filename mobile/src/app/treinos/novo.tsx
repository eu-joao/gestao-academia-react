import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  adicionar,
  atualizar,
  buscarPorId,
} from "../../services/treinoStorage";
import { validarTreino, ErrosTreino } from "../../utils/validarTreino";

const DIAS_OPCOES = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function TreinoFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [duracaoMin, setDuracaoMin] = useState("");
  const [erros, setErros] = useState<ErrosTreino>({});
  const [carregando, setCarregando] = useState(Boolean(id));
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    buscarPorId(id)
      .then((treino) => {
        if (ativo && treino) {
          setNome(treino.nome);
          setDiaSemana(treino.diaSemana);
          setDuracaoMin(String(treino.duracaoMin));
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  async function handleSalvar() {
    const dadosValidacao = { nome, diaSemana, duracaoMin };
    const errosEncontrados = validarTreino(dadosValidacao);

    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      return;
    }

    setErros({});
    setSalvando(true);

    try {
      const payload = {
        nome: nome.trim(),
        diaSemana: diaSemana.trim(),
        duracaoMin: Number(duracaoMin.trim()),
      };

      if (isEditing && id) {
        await atualizar(id, payload);
      } else {
        await adicionar(payload);
      }

      setSucesso(true);
      setTimeout(() => {
        router.replace("/treinos/index");
      }, 700);
    } catch {
      setErros({
        nome: "Ocorreu um erro ao salvar o treino. Tente novamente.",
      });
      setSalvando(false);
    }
  }

  function handleSelectDia(dia: string) {
    setDiaSemana(dia);
    if (erros.diaSemana) {
      setErros((prev) => ({ ...prev, diaSemana: undefined }));
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Carregando informações...</Text>
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
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar Treino" : "Novo Treino"}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de Sucesso (RF06) */}
        {sucesso && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text style={styles.successBannerText}>
              Treino {isEditing ? "atualizado" : "cadastrado"} com sucesso!
            </Text>
          </View>
        )}

        {/* Card do Formulário */}
        <View style={styles.formCard}>
          <Text style={styles.formSubtitle}>
            {isEditing
              ? "Modifique os dados da sessão selecionada."
              : "Preencha as informações para adicionar um novo treino à sua rotina."}
          </Text>

          {/* Campo Nome */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Nome do treino <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                Boolean(erros.nome) && styles.inputWrapperError,
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={18}
                color={erros.nome ? "#DC2626" : "#64748B"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Peito, Tríceps e Abdômen"
                placeholderTextColor="#94A3B8"
                value={nome}
                onChangeText={(val) => {
                  setNome(val);
                  if (erros.nome) {
                    setErros((prev) => ({ ...prev, nome: undefined }));
                  }
                }}
              />
            </View>
            {erros.nome && (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>{erros.nome}</Text>
              </View>
            )}
          </View>

          {/* Campo Dia da Semana */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Dia da semana <Text style={styles.required}>*</Text>
            </Text>

            {/* Chips de seleção rápida */}
            <View style={styles.chipsContainer}>
              {DIAS_OPCOES.map((dia) => {
                const ativo = diaSemana.toLowerCase() === dia.toLowerCase();
                return (
                  <TouchableOpacity
                    key={dia}
                    style={[styles.chip, ativo && styles.chipActive]}
                    onPress={() => handleSelectDia(dia)}
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

            <View
              style={[
                styles.inputWrapper,
                Boolean(erros.diaSemana) && styles.inputWrapperError,
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={erros.diaSemana ? "#DC2626" : "#64748B"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ou digite o dia da semana"
                placeholderTextColor="#94A3B8"
                value={diaSemana}
                onChangeText={(val) => {
                  setDiaSemana(val);
                  if (erros.diaSemana) {
                    setErros((prev) => ({ ...prev, diaSemana: undefined }));
                  }
                }}
              />
            </View>
            {erros.diaSemana && (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>{erros.diaSemana}</Text>
              </View>
            )}
          </View>

          {/* Campo Duração */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Duração estimada (minutos) <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                Boolean(erros.duracaoMin) && styles.inputWrapperError,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={erros.duracaoMin ? "#DC2626" : "#64748B"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: 50 (entre 1 e 300)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={duracaoMin}
                onChangeText={(val) => {
                  setDuracaoMin(val);
                  if (erros.duracaoMin) {
                    setErros((prev) => ({ ...prev, duracaoMin: undefined }));
                  }
                }}
              />
            </View>
            {erros.duracaoMin && (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>{erros.duracaoMin}</Text>
              </View>
            )}
          </View>

          {/* Ações */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
              onPress={handleSalvar}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={isEditing ? "checkmark-outline" : "add-outline"}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveButtonText}>
                    {isEditing ? "Salvar alterações" : "Adicionar treino"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  formSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#0F172A",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
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
  buttonContainer: {
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    height: 48,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
