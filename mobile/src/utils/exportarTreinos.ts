import { Alert, Share } from "react-native";
import { Treino } from "../services/treinoStorage";
import { DIAS_SEMANA, calcularEstatisticas } from "./estatisticas";

export async function exportarRelatorioTexto(
  treinos: Treino[],
): Promise<boolean> {
  const treinosAtivos = treinos.filter((t) => t.ativo !== false);

  if (treinosAtivos.length === 0) {
    Alert.alert(
      "Exportar Treinos",
      "Você ainda não possui treinos cadastrados para exportar.",
    );
    return false;
  }

  const stats = calcularEstatisticas(treinosAtivos);
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  let texto = `FICHA DE TREINOS - GESTÃO ACADEMIA\n`;
  texto += `Exportado em: ${dataHoje}\n`;
  texto += `Total de treinos: ${stats.totalTreinos} | Tempo semanal: ${stats.totalMinutosSemana} min\n`;
  texto += `Categoria principal: ${stats.categoriaFavorita}\n\n`;
  texto += `------------------------------------\n`;

  for (const dia of DIAS_SEMANA) {
    const treinosDoDia = treinosAtivos.filter((t) =>
      t.diaSemana.toLowerCase().includes(dia.toLowerCase()),
    );

    if (treinosDoDia.length > 0) {
      texto += `\n📅 ${dia.toUpperCase()}:\n`;
      treinosDoDia.forEach((t) => {
        texto += `  • ${t.nome} (${t.categoria}) - ${t.duracaoMin} min\n`;
      });
    }
  }

  texto += `\n------------------------------------\n`;
  texto += `Aplicativo Gestão Academia (Offline-First)\n`;

  try {
    const result = await Share.share({
      title: "Minha Ficha de Treinos",
      message: texto,
    });
    return result.action === Share.sharedAction;
  } catch {
    Alert.alert("Erro", "Não foi possível compartilhar o relatório.");
    return false;
  }
}

export async function exportarBackupJSON(treinos: Treino[]): Promise<boolean> {
  const treinosAtivos = treinos.filter((t) => t.ativo !== false);

  if (treinosAtivos.length === 0) {
    Alert.alert("Exportar Backup", "Nenhum treino disponível para backup.");
    return false;
  }

  const backupData = {
    versao: "1.0",
    dataExportacao: new Date().toISOString(),
    total: treinosAtivos.length,
    treinos: treinosAtivos,
  };

  const jsonString = JSON.stringify(backupData, null, 2);

  try {
    const result = await Share.share({
      title: "Backup de Treinos (JSON)",
      message: jsonString,
    });
    return result.action === Share.sharedAction;
  } catch {
    Alert.alert("Erro", "Não foi possível compartilhar o backup JSON.");
    return false;
  }
}
