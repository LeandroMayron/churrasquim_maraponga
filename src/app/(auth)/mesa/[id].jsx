import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../constants/Colors";
import supabase from "../../../lib/supabase";

import styles from "./components/styles";

// Importação dos modais
import ModalFechamento from "./components/modalFechamento";
import ModalDividirConta from "./components/modalDividirConta";
import ModalImpressao from "./components/modalImpressao";
import ModalImpressora from "./components/modalImpressora";
import ModalItens from "./components/modalItens";

export default function Mesa({ id, router, menuData }) {
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
  const [loading, setLoading] = useState(false);

  // ------------------------
  // FUNÇÕES AUXILIARES
  // ------------------------

  const calcularTotal = (pedidos) => {
    return (pedidos || []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
  };

  const calcularTotalPessoa = (pessoaId) => {
    const itens = pedidosPorPessoa[pessoaId] || [];
    return calcularTotal(itens);
  };

  const calcularTotaisPorConsumo = () => {
    if (!Array.isArray(pedidoEnviado)) return [];
    const totais = {};
    pedidoEnviado.forEach((pedido) => {
      const pessoa = pedido.pessoa_nome || "Mesa";
      const total = Number(pedido.total) || 0;
      totais[pessoa] = (totais[pessoa] || 0) + total;
    });
    return Object.values(totais);
  };

  const confirmarDivisao = async () => {
    console.log("✅ Divisão confirmada!");
    Alert.alert("Sucesso", "Divisão confirmada com sucesso!");
    setModalDividirConta(false);
  };

  const incrementarPessoas = () => setNumPessoas(numPessoas + 1);
  const decrementarPessoas = () =>
    setNumPessoas(numPessoas > 1 ? numPessoas - 1 : 1);

  // ------------------------
  // FUNÇÃO PARA FECHAR MESA
  // ------------------------
  const fecharMesa = async () => {
    try {
      const { data: pedidoAberto, error: fetchError } = await supabase
        .from("pedidos")
        .select("id, itens")
        .eq("mesa_id", id)
        .eq("pessoa_id", null)
        .eq("status", "aberto")
        .limit(1)
        .maybeSingle();

      if (fetchError || !pedidoAberto) {
        alert("Nenhum pedido aberto encontrado para esta mesa.");
        return;
      }

      const { error } = await supabase
        .from("pedidos")
        .update({ status: "fechado", pagamento: formaPagamento })
        .eq("id", pedidoAberto.id);

      if (!error) {
        setMesaFechada(true);
        setPedidoEnviado([]);
        setConfirmModalVisible(false);
      } else {
        alert("Erro ao fechar a mesa. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado ao fechar a mesa:", err);
      alert("Erro inesperado. Tente novamente.");
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

      {/* Lista de pedidos / UI geral */}
      <ScrollView style={styles.pedidoContainer}>
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

      {/* Botões */}
      {!mesaFechada && modoMesa && (
        <>
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
        </>
      )}

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
        setConfirmModalVisible={setConfirmModalVisible}
        setModalDividirConta={setModalDividirConta}
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
        selectedPersonId={selectedPersonId}
        setSelectedPersonId={setSelectedPersonId}
      />
      <ModalImpressora
        visible={printerModalVisible}
        setVisible={setPrinterModalVisible}
        printers={printers}
      />
      <ModalItens
        visible={modalVisible}
        setVisible={setModalVisible}
        loading={loading}
        menuData={menuData}
      />
    </SafeAreaView>
  );
}
