import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalImpressao({
  visible,
  setVisible,
  dadosParaImpressao,
  calcularTotal,
  selectedPersonId,
  setSelectedPersonId,
}) {
  const printCupom = () => {
    console.log("Imprimir cupom", dadosParaImpressao);
  };

  const confirmarPagamentoPessoa = (personId) => {
    console.log("Pagamento confirmado para pessoa:", personId);
    setSelectedPersonId(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModalContent}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Recibo / Pagamento
          </Text>

          <ScrollView style={{ maxHeight: 200, marginBottom: 12 }}>
            {dadosParaImpressao.map((item, index) => (
              <Text key={index} style={{ fontSize: 16 }}>
                {item.quantity}x {item.name} — R${" "}
                {(item.quantity * item.price).toFixed(2)}
              </Text>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
            Total: R$ {calcularTotal(dadosParaImpressao).toFixed(2)}
          </Text>

          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: Colors.gold, marginTop: 10 },
            ]}
            onPress={printCupom}
          >
            <Text style={[styles.closeButtonText, { color: Colors.black }]}>
              Imprimir
            </Text>
          </TouchableOpacity>

          {selectedPersonId && (
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors.acafrao, marginTop: 10 },
              ]}
              onPress={() => confirmarPagamentoPessoa(selectedPersonId)}
            >
              <Text style={styles.closeButtonText}>
                Confirmar Pagamento (marcar pago)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: Colors.gold, marginTop: 10 },
            ]}
            onPress={() => {
              setVisible(false);
              setSelectedPersonId(null);
            }}
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
