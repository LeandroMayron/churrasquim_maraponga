import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

export default function ModalDividirConta({ visible, onClose, onFecharMesa }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Fechar Mesa</Text>
          <Text style={styles.text}>
            Deseja fechar a mesa e gerar o recibo?
          </Text>
          <Button title="Fechar Mesa" onPress={onFecharMesa} />
          <Button title="Cancelar" color="red" onPress={onClose} />
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
    fontSize: 16,
  },
  text: {
    marginBottom: 20,
    fontSize: 14,
  },
});
