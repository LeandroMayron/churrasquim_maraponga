import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

export default function ModalDividirConta({ visible, onClose, onFecharMesa }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Fechar Mesa</Text>
          <Text>Deseja fechar a mesa e dividir a conta?</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onFecharMesa}
              style={[styles.button, { backgroundColor: Colors.success }]}
            >
              <Text style={styles.buttonText}>Fechar Mesa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: Colors.danger }]}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
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
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
