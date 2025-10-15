import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

export default function ModalDetalhesPedido({ visible, onClose, pedido }) {
  if (!pedido) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Detalhes do Pedido</Text>
          <Text>Nome: {pedido.nome}</Text>
          <Text>Quantidade: {pedido.quantidade}</Text>
          <Text>Preço: R$ {(pedido.preco || 0).toFixed(2)}</Text>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.button, { backgroundColor: Colors.danger }]}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  button: { marginTop: 12, padding: 10, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
