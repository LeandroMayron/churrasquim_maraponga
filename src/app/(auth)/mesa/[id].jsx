import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../lib/supabase"; // ajuste conforme seu path
import Colors from "../../../../constants/Colors";

export default function Mesa({ route, navigation }) {
  const { id } = route.params; // ID da mesa
  const [mesa, setMesa] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [itensMenu, setItensMenu] = useState([]);
  const [tipoConta, setTipoConta] = useState(null); // 'mesa' ou 'pessoa'
  const [modalTipoContaVisible, setModalTipoContaVisible] = useState(true);

  const [contasPorPessoa, setContasPorPessoa] = useState({}); // { pessoa1: [{item1},{item2}], pessoa2: [...] }
  const [totalMesa, setTotalMesa] = useState(0);

  const [novaPessoa, setNovaPessoa] = useState(""); // Para adicionar pessoas em contas individuais

  // Carregar dados da mesa
  const carregarMesa = async () => {
    const { data, error } = await supabase
      .from("mesas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.log(error);
    else setMesa(data);
  };

  // Carregar pedidos
  const carregarPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("mesa_id", id);

    if (error) console.log(error);
    else setPedidos(data);
  };

  useEffect(() => {
    carregarMesa();
    carregarPedidos();
  }, []);

  // Selecionar tipo de conta
  const selecionarTipoConta = (tipo) => {
    setTipoConta(tipo);
    setModalTipoContaVisible(false);
    if (tipo === "pessoa") setContasPorPessoa({});
  };

  // Adicionar item ao pedido
  const adicionarPedido = async (item, pessoa = null) => {
    if (tipoConta === "mesa") {
      const { data, error } = await supabase
        .from("pedidos")
        .insert([
          { mesa_id: id, item_id: item.id, nome: item.nome, preco: item.preco },
        ]);
      if (error) return console.log(error);
      setPedidos([...pedidos, { ...item, id: data[0].id }]);
    } else if (tipoConta === "pessoa") {
      if (!pessoa)
        return Alert.alert(
          "Erro",
          "Selecione uma pessoa para adicionar o pedido."
        );
      const novaConta = { ...contasPorPessoa };
      if (!novaConta[pessoa]) novaConta[pessoa] = [];
      novaConta[pessoa].push(item);
      setContasPorPessoa(novaConta);

      const { data, error } = await supabase
        .from("pedidos")
        .insert([
          {
            mesa_id: id,
            item_id: item.id,
            nome: item.nome,
            preco: item.preco,
            pessoa,
          },
        ]);
      if (error) console.log(error);
    }
    calcularTotal();
  };

  // Calcular total da mesa e por pessoa
  const calcularTotal = () => {
    if (tipoConta === "mesa") {
      const total = pedidos.reduce((acc, item) => acc + item.preco, 0);
      setTotalMesa(total);
    } else if (tipoConta === "pessoa") {
      const contas = {};
      Object.keys(contasPorPessoa).forEach((p) => {
        contas[p] = contasPorPessoa[p].reduce(
          (acc, item) => acc + item.preco,
          0
        );
      });
      setTotalMesa(Object.values(contas).reduce((acc, val) => acc + val, 0));
    }
  };

  // Dividir conta igualmente
  const dividirPorPessoa = () => {
    const num = prompt("Quantas pessoas vão dividir a conta?");
    const numPessoas = parseInt(num, 10);
    if (!numPessoas || numPessoas <= 0) return;
    const valorPorPessoa = totalMesa / numPessoas;
    Alert.alert(
      "Divisão de Conta",
      `Cada pessoa deve pagar R$ ${valorPorPessoa.toFixed(2)}`
    );
  };

  // Pagar conta de uma pessoa
  const pagarPessoa = async (pessoa) => {
    const totalPessoa = contasPorPessoa[pessoa].reduce(
      (acc, item) => acc + item.preco,
      0
    );
    Alert.alert(
      `Confirmar pagamento`,
      `Deseja confirmar pagamento de R$ ${totalPessoa.toFixed(
        2
      )} por ${pessoa}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            for (let item of contasPorPessoa[pessoa]) {
              await supabase
                .from("pedidos")
                .update({ pago: true })
                .eq("mesa_id", id)
                .eq("item_id", item.id)
                .eq("pessoa", pessoa);
            }
            const novaConta = { ...contasPorPessoa };
            delete novaConta[pessoa];
            setContasPorPessoa(novaConta);
            calcularTotal();
          },
        },
      ]
    );
  };

  // Adicionar nova pessoa na conta por pessoa
  const adicionarPessoa = () => {
    if (!novaPessoa.trim()) return;
    if (contasPorPessoa[novaPessoa])
      return Alert.alert("Erro", "Pessoa já existe.");
    setContasPorPessoa({ ...contasPorPessoa, [novaPessoa]: [] });
    setNovaPessoa("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Modal de escolha do tipo de conta */}
      <Modal
        visible={modalTipoContaVisible}
        transparent={true}
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000aa",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 20 }}>
              Escolha o tipo de conta:
            </Text>
            <Button
              title="Conta da Mesa"
              onPress={() => selecionarTipoConta("mesa")}
            />
            <View style={{ height: 10 }} />
            <Button
              title="Conta por Pessoa"
              onPress={() => selecionarTipoConta("pessoa")}
            />
          </View>
        </View>
      </Modal>

      {/* Total da mesa */}
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Total Mesa: R$ {totalMesa.toFixed(2)}
      </Text>

      {/* Lista de pedidos */}
      {tipoConta === "mesa" ? (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ccc" }}
            >
              <Text>
                {item.nome} - R$ {item.preco.toFixed(2)}
              </Text>
            </View>
          )}
        />
      ) : (
        <View>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <TextInput
              placeholder="Nome da pessoa"
              value={novaPessoa}
              onChangeText={setNovaPessoa}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                flex: 1,
                marginRight: 10,
                padding: 5,
              }}
            />
            <Button title="Adicionar" onPress={adicionarPessoa} />
          </View>

          {Object.keys(contasPorPessoa).map((pessoa) => (
            <View
              key={pessoa}
              style={{
                marginBottom: 20,
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{pessoa}</Text>
              {contasPorPessoa[pessoa].map((item, index) => (
                <Text key={index}>
                  {item.nome} - R$ {item.preco.toFixed(2)}
                </Text>
              ))}
              <Text>
                Total {pessoa}: R${" "}
                {contasPorPessoa[pessoa]
                  .reduce((acc, item) => acc + item.preco, 0)
                  .toFixed(2)}
              </Text>
              <Button
                title={`Pagar ${pessoa}`}
                onPress={() => pagarPessoa(pessoa)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Dividir conta igualmente */}
      {tipoConta === "mesa" && pedidos.length > 0 && (
        <Button
          title="Dividir igualmente por pessoa"
          onPress={dividirPorPessoa}
        />
      )}
    </View>
  );
}
