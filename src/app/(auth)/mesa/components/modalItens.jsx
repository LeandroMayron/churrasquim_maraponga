import React from "react";
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

export default function ModalItens({ visible, setVisible, loading, menuData }) {
  const toggleItemQuantity = (item, delta) => {
    console.log("Atualizar quantidade", item, delta);
  };

  const getItemQuantity = (item) => 0;

  const enviarPedido = () => {
    console.log("Pedido enviado");
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
