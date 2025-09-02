import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

export default function Mesa() {
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const fetchItens = async () => {
    setLoading(true);
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

  const abrirModal = () => {
    fetchItens();
    setModalVisible(true);
  };

  const toggleItemSelection = (item) => {
    const isSelected = selectedItems.some((i) => i.name === item.name);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((i) => i.name !== item.name));
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const enviarPedido = () => {
    console.log(`Pedido da mesa ${id}:`, selectedItems);
    setModalVisible(false);
    setSelectedItems([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>

      {/* Botão animado */}
      <TouchableWithoutFeedback
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={abrirModal}
      >
        <Animated.View
          style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.buttonText}>Fazer Pedido</Text>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Modal com categorias e itens */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>

            {loading ? (
              <ActivityIndicator color={Colors.gold} size="large" />
            ) : (
              <ScrollView style={{ maxHeight: "75%" }}>
                {Object.entries(menuData).map(([categoria, itens]) => (
                  <View key={categoria} style={styles.categoriaContainer}>
                    <Text style={styles.categoriaTitulo}>{categoria}</Text>
                    {Array.isArray(itens) &&
                      itens.map((item, index) => {
                        const isSelected = selectedItems.some(
                          (i) => i.name === item.name
                        );
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => toggleItemSelection(item)}
                            style={[
                              styles.itemContainer,
                              isSelected && {
                                backgroundColor: Colors.acafrao,
                              },
                            ]}
                          >
                            <Text style={styles.itemText}>{item.name}</Text>
                            <Text style={styles.itemPrice}>
                              R$ {item.price.toFixed(2)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={enviarPedido}
              style={[
                styles.closeButton,
                { marginBottom: 8, backgroundColor: Colors.gold },
              ]}
            >
              <Text style={[styles.closeButtonText, { color: Colors.black }]}>
                Enviar Pedido
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
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
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
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
  },
  itemText: {
    color: Colors.black,
    fontWeight: "bold",
    fontSize: 15,
  },
  itemPrice: {
    color: Colors.black,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: Colors.acafrao,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
});
