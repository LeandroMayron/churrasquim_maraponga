import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import ListaPedidos from "./components/ListaPedidos";
import MesaHeader from "./components/MesaHeader";
import ModalAdicionarPessoa from "./components/ModalAdicionarPessoa";
import ModalDetalhesPedido from "./components/ModalDetalhesPedido";
import ModalDividirConta from "./components/ModalDividirConta";

import { useMesa } from "./hooks/useMesas";
import { usePagamento } from "./hooks/usePagamentos";
import { usePedidos } from "./hooks/usePedidos";

export default function Mesa() {
  const { id: mesaId } = useLocalSearchParams();

  const { pedidos } = usePedidos(mesaId);
  const { pessoas, adicionarPessoa } = useMesa(mesaId);
  const { fecharMesa, loading } = usePagamento(mesaId);

  const [modalAdicionarVisible, setModalAdicionarVisible] = useState(false);
  const [modalDividirVisible, setModalDividirVisible] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const handleDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
    setModalDetalhesVisible(true);
  };

  return (
    <View style={styles.container}>
      <MesaHeader mesaId={mesaId} />

      <ScrollView style={styles.scroll}>
        <ListaPedidos pedidos={pedidos} onDetalhes={handleDetalhes} />

        <View style={styles.pessoasContainer}>
          <Text style={styles.sectionTitle}>Pessoas na mesa:</Text>
          {pessoas.map((p) => (
            <Text key={p.id} style={styles.pessoaNome}>
              - {p.nome}
            </Text>
          ))}
        </View>
      </ScrollView>

      <ModalAdicionarPessoa
        visible={modalAdicionarVisible}
        onClose={() => setModalAdicionarVisible(false)}
        onAdd={adicionarPessoa}
      />
      <ModalDividirConta
        visible={modalDividirVisible}
        onClose={() => setModalDividirVisible(false)}
        onFecharMesa={fecharMesa}
      />
      <ModalDetalhesPedido
        visible={modalDetalhesVisible}
        onClose={() => setModalDetalhesVisible(false)}
        pedido={pedidoSelecionado}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={() => setModalAdicionarVisible(true)}
        >
          <Ionicons name="person-add-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Adicionar Pessoa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.success }]}
          onPress={() => setModalDividirVisible(true)}
          disabled={loading}
        >
          <Ionicons name="cash-outline" size={20} color="white" />
          <Text style={styles.buttonText}>
            {loading ? "Processando..." : "Fechar Mesa"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  pessoasContainer: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  pessoaNome: { fontSize: 14, marginBottom: 4 },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
