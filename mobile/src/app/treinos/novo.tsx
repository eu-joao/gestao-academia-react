import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  adicionar,
  atualizar,
  buscarPorId,
} from "../../services/treinoStorage";
import { validarTreino, ErrosTreino } from "../../utils/validarTreino";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeToggle } from "../../components/ThemeToggle";

const CATEGORIAS_OPCOES = ["Musculação", "Cardio", "Funcional", "Mobilidade"];

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
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Musculação");
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
          if (treino.categoria) setCategoria(treino.categoria);
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
        categoria: categoria.trim(),
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
        router.replace("/treinos");
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando informações...
          </Text>
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
          onPress={() => router.back()}
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
          {isEditing ? "Editar Treino" : "Novo Treino"}
        </Text>
        <ThemeToggle size={18} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View>
              {/* Banner de Sucesso (RF06) */}
              {sucesso && (
                <View
                  style={[
                    styles.successBanner,
                    {
                      backgroundColor: colors.successLight,
                      borderColor: colors.success,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                  />
                  <Text
                    style={[
                      styles.successBannerText,
                      { color: colors.success },
                    ]}
                  >
                    Treino {isEditing ? "atualizado" : "cadastrado"} com
                    sucesso!
                  </Text>
                </View>
              )}

              {/* Card do Formulário */}
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.formSubtitle, { color: colors.textSecondary }]}
                >
                  {isEditing
                    ? "Modifique os dados da sessão selecionada."
                    : "Preencha as informações para adicionar um novo treino à sua rotina."}
                </Text>

                {/* Campo Nome */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Nome do treino <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      Boolean(erros.nome) && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={18}
                      color={erros.nome ? colors.danger : colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Ex: Treino A - Peito e Tríceps"
                      placeholderTextColor={colors.textMuted}
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
                        color={colors.danger}
                      />
                      <Text
                        style={[styles.errorText, { color: colors.danger }]}
                      >
                        {erros.nome}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Campo Categoria */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Categoria
                  </Text>
                  <View style={styles.chipsContainer}>
                    {CATEGORIAS_OPCOES.map((cat) => {
                      const ativo = categoria === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: ativo
                                ? colors.primary
                                : colors.surface,
                              borderColor: ativo
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          onPress={() => setCategoria(cat)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: ativo ? "#FFFFFF" : colors.textSecondary,
                              },
                              ativo && { fontWeight: "700" },
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Campo Dia da Semana */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Dia da semana <Text style={styles.required}>*</Text>
                  </Text>

                  {/* Chips de seleção rápida */}
                  <View style={styles.chipsContainer}>
                    {DIAS_OPCOES.map((dia) => {
                      const ativo =
                        diaSemana.toLowerCase() === dia.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={dia}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: ativo
                                ? colors.primary
                                : colors.surface,
                              borderColor: ativo
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          onPress={() => handleSelectDia(dia)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: ativo ? "#FFFFFF" : colors.textSecondary,
                              },
                              ativo && { fontWeight: "700" },
                            ]}
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
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      Boolean(erros.diaSemana) && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={
                        erros.diaSemana ? colors.danger : colors.textSecondary
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Ou digite o dia da semana"
                      placeholderTextColor={colors.textMuted}
                      value={diaSemana}
                      onChangeText={(val) => {
                        setDiaSemana(val);
                        if (erros.diaSemana) {
                          setErros((prev) => ({
                            ...prev,
                            diaSemana: undefined,
                          }));
                        }
                      }}
                    />
                  </View>
                  {erros.diaSemana && (
                    <View style={styles.errorRow}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={14}
                        color={colors.danger}
                      />
                      <Text
                        style={[styles.errorText, { color: colors.danger }]}
                      >
                        {erros.diaSemana}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Campo Duração */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Duração estimada (minutos){" "}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      Boolean(erros.duracaoMin) && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={
                        erros.duracaoMin ? colors.danger : colors.textSecondary
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Ex: 50 (entre 1 e 300)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={duracaoMin}
                      onChangeText={(val) => {
                        setDuracaoMin(val);
                        if (erros.duracaoMin) {
                          setErros((prev) => ({
                            ...prev,
                            duracaoMin: undefined,
                          }));
                        }
                      }}
                    />
                  </View>
                  {erros.duracaoMin && (
                    <View style={styles.errorRow}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={14}
                        color={colors.danger}
                      />
                      <Text
                        style={[styles.errorText, { color: colors.danger }]}
                      >
                        {erros.duracaoMin}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Ações */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: colors.primary },
                      salvando && styles.saveButtonDisabled,
                    ]}
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
                    style={[
                      styles.cancelButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  formCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
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
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
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
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
