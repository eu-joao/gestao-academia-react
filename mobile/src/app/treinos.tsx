import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import {
  Treino,
  listar,
  adicionar,
  atualizar,
  remover,
} from "../services/treinoStorage";
import { validarTreino, ErrosTreino } from "../utils/validarTreino";

export default function TreinosScreen() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [duracaoMin, setDuracaoMin] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erros, setErros] = useState<ErrosTreino>({});

  async function carregar() {
    setTreinos(await listar());
  }

  useEffect(() => {
    let ativo = true;

    listar().then((dados) => {
      if (ativo) setTreinos(dados);
    });

    return () => {
      ativo = false;
    };
  }, []);

  function limparFormulario() {
    setNome("");
    setDiaSemana("");
    setDuracaoMin("");
    setEditandoId(null);
    setErros({});
  }

  async function salvar() {
    const novosErros = validarTreino({ nome, diaSemana, duracaoMin });
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    const dados = {
      nome: nome.trim(),
      diaSemana: diaSemana.trim(),
      duracaoMin: Number(duracaoMin),
    };

    if (editandoId) {
      await atualizar(editandoId, dados);
    } else {
      await adicionar(dados);
    }
    limparFormulario();
    carregar();
  }

  function editar(treino: Treino) {
    setNome(treino.nome);
    setDiaSemana(treino.diaSemana);
    setDuracaoMin(String(treino.duracaoMin));
    setEditandoId(treino.id);
  }

  async function excluir(id: string) {
    await remover(id);
    carregar();
  }

  function alterar(campo: keyof ErrosTreino, setter: (valor: string) => void) {
    return (valor: string) => {
      setter(valor);
      setErros((e) => ({ ...e, [campo]: undefined }));
    };
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="Nome do treino"
        value={nome}
        onChangeText={alterar("nome", setNome)}
      />
      {erros.nome && <Text style={{ color: "red" }}>{erros.nome}</Text>}

      <TextInput
        placeholder="Dia da semana"
        value={diaSemana}
        onChangeText={alterar("diaSemana", setDiaSemana)}
      />
      {erros.diaSemana && (
        <Text style={{ color: "red" }}>{erros.diaSemana}</Text>
      )}

      <TextInput
        placeholder="Duração (min)"
        keyboardType="numeric"
        value={duracaoMin}
        onChangeText={alterar("duracaoMin", setDuracaoMin)}
      />
      {erros.duracaoMin && (
        <Text style={{ color: "red" }}>{erros.duracaoMin}</Text>
      )}

      <Button title={editandoId ? "Atualizar" : "Adicionar"} onPress={salvar} />
      {editandoId && (
        <Button title="Cancelar edição" onPress={limparFormulario} />
      )}

      <FlatList
        data={treinos}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>
              {item.nome} - {item.diaSemana} - {item.duracaoMin} min
            </Text>
            <Button title="Editar" onPress={() => editar(item)} />
            <Button
              title="Excluir"
              color="red"
              onPress={() => excluir(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
