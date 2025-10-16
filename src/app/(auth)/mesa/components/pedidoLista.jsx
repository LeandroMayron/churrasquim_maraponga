import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../../constants/Colors";

export const PedidoLista = ({
  pedidoEnviado,
  mesaFechada,
  modoMesa,
  calcularTotal,
  setModalEscolhaFechamento,
  setDadosParaImpressao,
  setModalImpressaoVisivel,
  removerItemDoPedido,
}) => {
  return (
    <View style={{ marginTop: 30, width: "90%", alignItems: "center" }}>
      <Text
        style={{
          color: Colors.gold,
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Pedidos Feitos
      </Text>

      {pedidoEnviado.length === 0 ? (
        <Text style={{ color: Colors.gray, fontStyle: "italic" }}>
          {mesaFechada ? "Mesa já fechada." : "Nenhum pedido ainda."}
        </Text>
      ) : (
        <>
          {pedidoEnviado.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{ color: Colors.white, fontSize: 16, marginVertical: 4 }}
              >
                {item.quantity}x {item.name} — R${" "}
                {(item.quantity * item.price).toFixed(2)}
              </Text>
              {!mesaFechada && (
                <TouchableOpacity
                  style={{ padding: 5, marginLeft: 10 }}
                  onPress={() => removerItemDoPedido(item, null)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.gold}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTopWidth: 1,
              borderColor: Colors.gold,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: Colors.gold, fontSize: 18, fontWeight: "bold" }}
            >
              Total a Pagar:
            </Text>
            <Text
              style={{
                color: Colors.white,
                fontSize: 20,
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              R$ {calcularTotal(pedidoEnviado).toFixed(2)}
            </Text>
          </View>

          {!mesaFechada && (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: Colors.gold, marginBottom: 10 }}>
                Selecione a forma de pagamento:
              </Text>
              {/* Botões de pagamento podem ser tratados no componente principal */}
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.gold,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
                onPress={() => setModalEscolhaFechamento(true)}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Fechar Mesa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.gold,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setDadosParaImpressao(pedidoEnviado);
                  setModalImpressaoVisivel(true);
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Imprimir Pedido
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};
