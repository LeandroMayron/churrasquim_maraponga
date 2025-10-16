import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalItens({
  visible,
  setVisible,
  loading,
  menuData,
  pedidoEnviado,
  setPedidoEnviado,
}) {
  const [quantidades, setQuantidades] = useState({});

  useEffect(() => {
    // Resetar quantidades ao abrir o modal
    if (visible) {
      const initialQuantities = {};
      Object.values(menuData || {}).forEach((itens) => {
        itens.forEach((item) => {
          initialQuantities[item.name] = 0;
        });
      });
      setQuantidades(initialQuantities);
    }
  }, [visible, menuData]);

  const toggleItemQuantity = (item, delta) => {
    setQuantidades((prev) => {
      const newQty = Math.max(0, (prev[item.name] || 0) + delta);
      return { ...prev, [item.name]: newQty };
    });
  };

  const enviarPedido = () => {
    const novosPedidos = [];

    Object.entries(quantidades).forEach(([nome, qty]) => {
      if (qty > 0) {
        // Encontrar item no menu
        let itemData = null;
        for (const categoria of Object.values(menuData)) {
          const encontrado = categoria.find((i) => i.name === nome);
          if (encontrado) {
            itemData = encontrado;
            break;
          }
        }
        if (itemData) {
          novosPedidos.push({ ...itemData, quantity: qty });
        }
      }
    });

    if (novosPedidos.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um item para enviar.");
      return;
    }

    // Adicionar aos pedidos existentes
    setPedidoEnviado([...pedidoEnviado, ...novosPedidos]);
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
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
                      const quantity = quantidades[item.name] || 0;
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
                            <Text style={styles.quantityText}>{quantity}</Text>
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
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
