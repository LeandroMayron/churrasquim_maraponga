import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalFechamento({
  visible,
  setVisible,
  setConfirmModalVisible,
  setModalDividirConta,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModalContent}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Como deseja finalizar?
          </Text>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: Colors.gold }]}
            onPress={() => {
              setVisible(false);
              setConfirmModalVisible(true);
            }}
          >
            <Text style={[styles.closeButtonText, { color: Colors.black }]}>
              Fechar Conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: Colors.acafrao, marginTop: 10 },
            ]}
            onPress={() => {
              setVisible(false);
              setModalDividirConta(true);
            }}
          >
            <Text style={styles.closeButtonText}>Dividir Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeButton, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
