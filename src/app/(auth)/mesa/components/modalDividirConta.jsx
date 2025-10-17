import React from "react";
import { Modal, View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalDividirConta({
  visible,
  setVisible,
  numPessoas,
  setNumPessoas,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dividir Conta</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setNumPessoas(numPessoas > 1 ? numPessoas - 1 : 1)}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 20, marginHorizontal: 15 }}>
              {numPessoas}
            </Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setNumPessoas(numPessoas + 1)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.acafrao }]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={() => {
                onConfirm();
                setVisible(false);
              }}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
