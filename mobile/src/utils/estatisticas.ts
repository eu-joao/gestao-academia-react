import { Treino } from "../services/treinoStorage";

export const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

export interface ResumoEstatisticas {
  totalTreinos: number;
  totalMinutosSemana: number;
  categoriaFavorita: string;
  minutosPorDia: { dia: string; sigla: string; minutos: number; qtd: number }[];
  distribuicaoCategorias: {
    categoria: string;
    qtd: number;
    porcentagem: number;
  }[];
  maiorMinutosDia: number;
}

export function calcularEstatisticas(treinos: Treino[]): ResumoEstatisticas {
  const treinosAtivos = treinos.filter((t) => t.ativo !== false);
  const totalTreinos = treinosAtivos.length;

  const totalMinutosSemana = treinosAtivos.reduce(
    (acc, t) => acc + (Number(t.duracaoMin) || 0),
    0,
  );

  // Categorias
  const contagemCategorias: Record<string, number> = {};
  for (const t of treinosAtivos) {
    const cat = t.categoria || "Outro";
    contagemCategorias[cat] = (contagemCategorias[cat] || 0) + 1;
  }

  let categoriaFavorita = "Nenhuma";
  let maxCatQtd = 0;
  for (const [cat, qtd] of Object.entries(contagemCategorias)) {
    if (qtd > maxCatQtd) {
      maxCatQtd = qtd;
      categoriaFavorita = cat;
    }
  }

  const distribuicaoCategorias = Object.entries(contagemCategorias)
    .map(([categoria, qtd]) => ({
      categoria,
      qtd,
      porcentagem:
        totalTreinos > 0 ? Math.round((qtd / totalTreinos) * 100) : 0,
    }))
    .sort((a, b) => b.qtd - a.qtd);

  // Minutos por dia da semana
  const siglas: Record<string, string> = {
    Segunda: "Seg",
    Terça: "Ter",
    Quarta: "Qua",
    Quinta: "Qui",
    Sexta: "Sex",
    Sábado: "Sáb",
    Domingo: "Dom",
  };

  let maiorMinutosDia = 0;
  const minutosPorDia = DIAS_SEMANA.map((dia) => {
    const treinosDoDia = treinosAtivos.filter((t) =>
      normalizarTexto(t.diaSemana).includes(normalizarTexto(dia)),
    );
    const minutos = treinosDoDia.reduce(
      (acc, t) => acc + (Number(t.duracaoMin) || 0),
      0,
    );
    if (minutos > maiorMinutosDia) {
      maiorMinutosDia = minutos;
    }
    return {
      dia,
      sigla: siglas[dia] || dia.substring(0, 3),
      minutos,
      qtd: treinosDoDia.length,
    };
  });

  return {
    totalTreinos,
    totalMinutosSemana,
    categoriaFavorita,
    minutosPorDia,
    distribuicaoCategorias,
    maiorMinutosDia: maiorMinutosDia > 0 ? maiorMinutosDia : 60,
  };
}

export function obterNomeDiaSemanaAtual(data: Date = new Date()): string {
  const mapDias = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return mapDias[data.getDay()];
}

export function obterTreinosDeHoje(
  treinos: Treino[],
  data: Date = new Date(),
): Treino[] {
  const diaHoje = obterNomeDiaSemanaAtual(data);
  const diaNormalizado = normalizarTexto(diaHoje);

  return treinos.filter(
    (t) =>
      t.ativo !== false &&
      normalizarTexto(t.diaSemana).includes(diaNormalizado),
  );
}

function normalizarTexto(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
