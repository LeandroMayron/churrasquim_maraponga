import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import styles from "./styles";
import Colors from "../../../../../constants/Colors";

export default function ModalItens({
  visible,
  setVisible,
  menuData,
  onAddItem,
}) {
  const [quantities, setQuantities] = useState({});

  const toggleItemQuantity = (item, delta) => {
    const current = quantities[item.name] || 0;
    const newQuantity = current + delta < 0 ? 0 : current + delta;
    setQuantities({ ...quantities, [item.name]: newQuantity });
  };

  const getItemQuantity = (item) => quantities[item.name] || 0;

  const enviarPedido = () => {
    onAddItem(quantities);
    setVisible(false);
    setQuantities({});
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione os Itens</Text>

          {menuData ? (
            <ScrollView style={{ maxHeight: "75%" }}>
              {Object.entries(menuData).map(([categoria, itens]) => (
                <View key={categoria} style={styles.categoriaContainer}>
                  <Text style={styles.categoriaTitulo}>{categoria}</Text>
                  {itens.map((item, index) => {
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
          ) : (
            <ActivityIndicator size="large" color={Colors.gold} />
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
