import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../../lib/supabase";

export default function Mesa() {
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pedidoEnviado, setPedidoEnviado] = useState([]);
  const [mesaFechada, setMesaFechada] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState(null);

  // 🔹 Carregar pedidos existentes do Supabase
  useEffect(() => {
    const carregarPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("mesa_id", id)
        .eq("status", "aberto");

      if (!error && data.length > 0) {
        setPedidoEnviado(data[0].itens);
        setMesaFechada(false);
      }
    };
    carregarPedidos();
  }, [id]);

  const abrirModal = async () => {
    setLoading(true);
    setModalVisible(true);
    try {
      const response = await fetch(
        "https://6644-fontend.github.io/menu-churrasquinho-maraponga/menu.json"
      );
      const data = await response.json();
      setMenuData(data);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemQuantity = (item, delta) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        const newQuantity = exists.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((i) => i.name !== item.name);
        } else {
          return prev.map((i) =>
            i.name === item.name ? { ...i, quantity: newQuantity } : i
          );
        }
      } else if (delta > 0) {
        return [...prev, { ...item, quantity: delta }];
      }
      return prev;
    });
  };

  const getItemQuantity = (item) => {
    const found = selectedItems.find((i) => i.name === item.name);
    return found ? found.quantity : 0;
  };

  // 🔹 Enviar pedido para Supabase
  const enviarPedido = async () => {
    const novoPedido = [...pedidoEnviado];

    selectedItems.forEach((novoItem) => {
      const existente = novoPedido.find((p) => p.name === novoItem.name);
      if (existente) {
        existente.quantity += novoItem.quantity;
      } else {
        novoPedido.push({ ...novoItem });
      }
    });

    setPedidoEnviado(novoPedido);
    setSelectedItems([]);
    setModalVisible(false);

    // salva no Supabase
    const { error } = await supabase.from("pedidos").upsert({
      mesa_id: id,
      itens: novoPedido,
      status: "aberto",
      total: calcularTotal(novoPedido),
    });

    if (error) console.error("Erro ao salvar pedido:", error);
  };

  const calcularTotal = (lista = pedidoEnviado) => {
    return lista.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  // 🔹 Fechar mesa
  const fecharMesa = async () => {
    if (!formaPagamento) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    const { error } = await supabase
      .from("pedidos")
      .update({ status: "fechado", pagamento: formaPagamento })
      .eq("mesa_id", id)
      .eq("status", "aberto");

    if (!error) {
      setMesaFechada(true);
      setPedidoEnviado([]);
      alert("Mesa fechada com sucesso!");
    } else {
      console.error("Erro ao fechar mesa:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>

      {!mesaFechada && (
        <TouchableOpacity style={styles.button} onPress={abrirModal}>
          <Text style={styles.buttonText}>Fazer Pedido</Text>
        </TouchableOpacity>
      )}

      {/* Lista de pedidos enviados */}
      <View style={styles.pedidoContainer}>
        <Text style={styles.pedidoTitulo}>Pedidos Feitos</Text>
        {pedidoEnviado.length === 0 ? (
          <Text style={styles.emptyText}>
            {mesaFechada ? "Mesa já fechada." : "Nenhum pedido ainda."}
          </Text>
        ) : (
          <>
            {pedidoEnviado.map((item, index) => (
              <Text key={index} style={styles.pedidoItem}>
                {item.quantity}x {item.name} — R${" "}
                {(item.quantity * item.price).toFixed(2)}
              </Text>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total a Pagar:</Text>
              <Text style={styles.totalValue}>
                R$ {calcularTotal().toFixed(2)}
              </Text>
            </View>

            {/* 🔹 Escolher forma de pagamento */}
            {!mesaFechada && (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: Colors.gold, marginBottom: 10 }}>
                  Selecione a forma de pagamento:
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setFormaPagamento("dinheiro")}
                  >
                    <Text style={styles.closeButtonText}>Dinheiro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setFormaPagamento("cartão")}
                  >
                    <Text style={styles.closeButtonText}>Cartão</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setFormaPagamento("pix")}
                  >
                    <Text style={styles.closeButtonText}>PIX</Text>
                  </TouchableOpacity>
                </View>

                {/* 🔹 Botão fechar mesa */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: Colors.gold, marginTop: 12 },
                  ]}
                  onPress={fecharMesa}
                >
                  <Text
                    style={[styles.closeButtonText, { color: Colors.black }]}
                  >
                    Fechar Mesa
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Modal de Itens */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione os Itens</Text>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.gold} />
            ) : (
              <ScrollView style={{ maxHeight: "75%" }}>
                {Object.entries(menuData).map(([categoria, itens]) => (
                  <View key={categoria} style={styles.categoriaContainer}>
                    <Text style={styles.categoriaTitulo}>{categoria}</Text>
                    {Array.isArray(itens) &&
                      itens.map((item, index) => {
                        const quantity = getItemQuantity(item);
                        return (
                          <View key={index} style={styles.itemContainer}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemText}>{item.name}</Text>
                              <Text style={styles.itemPrice}>
                                R$ {item.price.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => toggleItemQuantity(item, -1)}
                              >
                                <Text style={styles.qtyButtonText}>-</Text>
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>
                                {quantity}
                              </Text>
                              <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => toggleItemQuantity(item, 1)}
                              >
                                <Text style={styles.qtyButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Colors.gold }]}
              onPress={enviarPedido}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Enviar Pedido
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: Colors.black,
    alignItems: "center",
  },
  title: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.acafrao,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  pedidoContainer: {
    marginTop: 30,
    width: "90%",
    alignItems: "center",
  },
  pedidoTitulo: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pedidoItem: {
    color: Colors.white,
    fontSize: 16,
    marginVertical: 2,
  },
  emptyText: {
    color: Colors.gray,
    fontStyle: "italic",
  },
  totalContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.gold,
    width: "100%",
    alignItems: "center",
  },
  totalText: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  modalTitle: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  categoriaContainer: {
    marginBottom: 16,
  },
  categoriaTitulo: {
    color: Colors.acafrao,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  itemContainer: {
    backgroundColor: Colors.gold,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    color: Colors.black,
    fontWeight: "bold",
    fontSize: 15,
  },
  itemPrice: {
    color: Colors.black,
    fontWeight: "600",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    backgroundColor: Colors.acafrao,
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  qtyButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  quantityText: {
    color: Colors.black,
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.acafrao,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
