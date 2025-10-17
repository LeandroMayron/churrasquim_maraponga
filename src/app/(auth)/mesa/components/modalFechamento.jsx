import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalFechamento({ visible, setVisible, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Fechar Mesa?</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 20,
            }}
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
