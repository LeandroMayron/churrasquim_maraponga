import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import Colors from "../../../../../constants/Colors";

export const ModalConfirmacao = ({ visible, setVisible, fecharMesa }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000aa",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: 20,
            width: "80%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Deseja realmente fechar a mesa?
          </Text>
          <Text style={{ marginBottom: 20 }}>
            Isso encerrará os pedidos para esta mesa.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: Colors.gold,
              padding: 10,
              borderRadius: 8,
              width: "100%",
              marginBottom: 10,
            }}
            onPress={async () => {
              setVisible(false);
              await fecharMesa();
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Confirmar Fechamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 10,
              borderRadius: 8,
              width: "100%",
              borderWidth: 1,
              borderColor: "#ccc",
            }}
            onPress={() => setVisible(false)}
          >
            <Text style={{ textAlign: "center" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
