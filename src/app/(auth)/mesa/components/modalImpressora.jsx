import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalImpressora({
  visible,
  setVisible,
  printers,
  onSelectPrinter,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione a Impressora</Text>

          <FlatList
            data={printers}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.closeButton, { marginVertical: 4 }]}
                onPress={() => onSelectPrinter(item)}
              >
                <Text style={styles.closeButtonText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
