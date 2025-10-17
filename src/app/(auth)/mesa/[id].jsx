import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "../../../../constants/Colors";
import supabase from "../../../lib/supabase";

import styles from "./components/styles";

// Importação dos modais
import ModalFechamento from "./components/modalFechamento";
import ModalDividirConta from "./components/modalDividirConta";
import ModalImpressao from "./components/modalImpressao";
import ModalImpressora from "./components/modalImpressora";
import ModalItens from "./components/modalItens";

export default function Mesa({ id }) {
  const router = useRouter();

  // Estados principais
  const [modoMesa, setModoMesa] = useState(null);
  const [pedidoEnviado, setPedidoEnviado] = useState([]);
  const [mesaFechada, setMesaFechada] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [dadosParaImpressao, setDadosParaImpressao] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Pessoas / divisão de conta
  const [pessoas, setPessoas] = useState([]);
  const [novoNomePessoa, setNovoNomePessoa] = useState("");
  const [isLoadingPessoas, setIsLoadingPessoas] = useState(false);
  const [pedidosPorPessoa, setPedidosPorPessoa] = useState({});
  const [modoDivisao, setModoDivisao] = useState("consumo");
  const [numPessoas, setNumPessoas] = useState(1);
  const [itemOwners, setItemOwners] = useState([]);

  // Modais
  const [modalEscolhaFechamento, setModalEscolhaFechamento] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [modalDividirConta, setModalDividirConta] = useState(false);
  const [modalImpressaoVisivel, setModalImpressaoVisivel] = useState(false);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Menu JSON
  const [menuData, setMenuData] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    fetch(
      "https://6644-fontend.github.io/menu-churrasquinho-maraponga/menu.json"
    )
      .then((res) => res.json())
      .then((data) => setMenuData(data))
      .catch((err) => console.error("Erro ao carregar menu:", err))
      .finally(() => setLoadingMenu(false));
  }, []);

  // ------------------------
  // FUNÇÕES AUXILIARES
  // ------------------------
  const calcularTotal = (pedidos) =>
    (pedidos || []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );

  const calcularTotalPessoa = (pessoaId) => {
    const itens = pedidosPorPessoa[pessoaId] || [];
    return calcularTotal(itens);
  };

  const confirmarDivisao = () => {
    Alert.alert("Sucesso", "Divisão confirmada!");
    setModalDividirConta(false);
  };

  const incrementarPessoas = () => setNumPessoas(numPessoas + 1);
  const decrementarPessoas = () =>
    setNumPessoas(numPessoas > 1 ? numPessoas - 1 : 1);

  const fecharMesa = async () => {
    try {
      const { data: pedidoAberto, error } = await supabase
        .from("pedidos")
        .select("id, itens")
        .eq("mesa_id", id)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      if (error || !pedidoAberto) {
        alert("Nenhum pedido aberto encontrado.");
        return;
      }

      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ status: "fechado", pagamento: formaPagamento })
        .eq("id", pedidoAberto.id);

      if (!updateError) {
        setMesaFechada(true);
        setPedidoEnviado([]);
      } else {
        alert("Erro ao fechar mesa.");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro inesperado.");
    }
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>

      {/* Escolha do modo */}
      {modoMesa === null && (
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={{ color: Colors.gold, marginBottom: 8 }}>
            Como deseja iniciar os pedidos?
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={() => setModoMesa("mesa")}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Pedido (mesa inteira)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.acafrao }]}
              onPress={() => setModoMesa("por_pessoa")}
            >
              <Text style={styles.closeButtonText}>Pedido por pessoa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de pedidos */}
      <ScrollView
        style={styles.pedidoContainer}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {pedidoEnviado.length === 0 ? (
          <Text style={styles.emptyText}>
            {mesaFechada ? "Mesa já fechada." : "Nenhum pedido ainda."}
          </Text>
        ) : (
          pedidoEnviado.map((item, index) => (
            <View key={index} style={styles.pedidoItemContainer}>
              <Text style={styles.pedidoItem}>
                {item.quantity}x {item.name} — R${" "}
                {(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão fazer pedido */}
      {!mesaFechada && modoMesa && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            {modoMesa === "por_pessoa"
              ? "Fazer Pedido (pessoa)"
              : "Fazer Pedido"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Botão voltar */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={Colors.gold}
          style={{ alignSelf: "center", marginTop: 8 }}
        />
      </Pressable>

      {/* MODAIS */}
      <ModalFechamento
        visible={modalEscolhaFechamento}
        setVisible={setModalEscolhaFechamento}
        fecharMesa={fecharMesa}
      />
      <ModalDividirConta
        visible={modalDividirConta}
        setVisible={setModalDividirConta}
        pedidoEnviado={pedidoEnviado}
        modoDivisao={modoDivisao}
        setModoDivisao={setModoDivisao}
        numPessoas={numPessoas}
        setNumPessoas={setNumPessoas}
        confirmarDivisao={confirmarDivisao}
      />
      <ModalImpressao
        visible={modalImpressaoVisivel}
        setVisible={setModalImpressaoVisivel}
        dadosParaImpressao={dadosParaImpressao}
        calcularTotal={calcularTotal}
      />
      <ModalImpressora
        visible={printerModalVisible}
        setVisible={setPrinterModalVisible}
        printers={printers}
      />
      <ModalItens
        visible={modalVisible}
        setVisible={setModalVisible}
        loading={loadingMenu}
        menuData={menuData}
      />
    </SafeAreaView>
  );
}
