import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalDividirConta({
  visible,
  setVisible,
  pedidoEnviado,
  modoDivisao,
  setModoDivisao,
  numPessoas,
  setNumPessoas,
  confirmarDivisao,
}) {
  const calcularTotaisPorConsumo = () => {
    if (!Array.isArray(pedidoEnviado)) return [];
    const totais = {};
    pedidoEnviado.forEach((pedido) => {
      const pessoa = pedido.pessoa_nome || "Mesa";
      const total = Number(pedido.total) || 0;
      totais[pessoa] = (totais[pessoa] || 0) + total;
    });
    return Object.values(totais);
  };

  const incrementarPessoas = () => setNumPessoas(numPessoas + 1);
  const decrementarPessoas = () =>
    setNumPessoas(numPessoas > 1 ? numPessoas - 1 : 1);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.confirmModalContent,
            { width: "92%", maxHeight: "90%" },
          ]}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Dividir Conta
          </Text>

          <View
            style={{ flexDirection: "row", marginBottom: 12, width: "100%" }}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                modoDivisao === "consumo" && styles.optionButtonActive,
              ]}
              onPress={() => setModoDivisao("consumo")}
            >
              <Text
                style={{
                  color: modoDivisao === "consumo" ? Colors.black : "#555",
                  fontWeight: modoDivisao === "consumo" ? "bold" : "normal",
                }}
              >
                Por consumo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                modoDivisao === "pessoa" && styles.optionButtonActive,
              ]}
              onPress={() => setModoDivisao("pessoa")}
            >
              <Text
                style={{
                  color: modoDivisao === "pessoa" ? Colors.black : "#555",
                  fontWeight: modoDivisao === "pessoa" ? "bold" : "normal",
                }}
              >
                Por pessoa
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: "100%", alignItems: "center" }}>
            {modoDivisao === "pessoa" ? (
              <>
                <Text style={{ marginBottom: 8 }}>Número de pessoas:</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={decrementarPessoas}
                  >
                    <Text style={{ fontWeight: "700" }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 12, fontWeight: "600" }}>
                    {numPessoas}
                  </Text>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={incrementarPessoas}
                  >
                    <Text style={{ fontWeight: "700" }}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text>
                  Cada pessoa paga:{" "}
                  <Text style={{ fontWeight: "700" }}>
                    R$ {(calcularTotaisPorConsumo()[0] || 0).toFixed(2)}
                  </Text>
                </Text>
              </>
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text style={{ marginBottom: 8 }}>
                  Totais por pessoa (consumo):
                </Text>
                {calcularTotaisPorConsumo().map((v, i) => (
                  <Text key={i}>
                    Pessoa {i + 1}: R$ {v.toFixed(2)}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View style={{ marginTop: 14, width: "100%" }}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={confirmarDivisao}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Confirmar divisão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
