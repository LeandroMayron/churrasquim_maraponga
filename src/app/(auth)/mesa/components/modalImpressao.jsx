import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalImpressao({
  visible,
  setVisible,
  dadosParaImpressao,
  calcularTotal,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Resumo do Pedido</Text>

          <ScrollView style={{ maxHeight: "75%" }}>
            {dadosParaImpressao.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  R$ {(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            Total: R$ {calcularTotal(dadosParaImpressao)}
          </Text>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: Colors.gold }]}
            onPress={() => setVisible(false)}
          >
            <Text style={[styles.closeButtonText, { color: Colors.black }]}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
