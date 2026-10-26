import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import {
  Treino,
  listar,
  adicionar,
  atualizar,
  remover,
} from "../services/treinoStorage";

export default function TreinosScreen() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [nome, setNome] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [duracaoMin, setDuracaoMin] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

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
  }

  async function salvar() {
    const dados = { nome, diaSemana, duracaoMin: Number(duracaoMin) };

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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="Nome do treino"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        placeholder="Dia da semana"
        value={diaSemana}
        onChangeText={setDiaSemana}
      />
      <TextInput
        placeholder="Duração (min)"
        keyboardType="numeric"
        value={duracaoMin}
        onChangeText={setDuracaoMin}
      />
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
