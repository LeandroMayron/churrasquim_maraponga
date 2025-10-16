import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../../constants/Colors";

export default function ModalImpressora({ visible, setVisible, printers }) {
  const selecionarImpressora = (printer) => {
    console.log("Impressora selecionada:", printer);
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione uma Impressora</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {printers.map((printer, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemContainer}
                onPress={() => selecionarImpressora(printer)}
              >
                <Text style={styles.itemText}>
                  <Ionicons name="print" size={18} /> {printer.deviceName}
                </Text>
                <Text style={styles.itemPrice}>{printer.innerMacAddress}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: Colors.acafrao, marginTop: 10 },
            ]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
