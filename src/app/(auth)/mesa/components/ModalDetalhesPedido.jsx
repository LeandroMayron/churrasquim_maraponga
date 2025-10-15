import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

export default function ModalDetalhesPedido({ visible, onClose, pedido }) {
  if (!pedido) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{pedido.nome}</Text>
          <Text>Quantidade: {pedido.quantidade}</Text>
          <Text>Preço: R$ {pedido.preco.toFixed(2)}</Text>
          <Button title="Fechar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa",
  },
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16
  },
});
