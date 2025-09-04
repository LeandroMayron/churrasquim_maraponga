import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase"; // ajuste o caminho se precisar

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const Salao = () => {
  const [mesas, setMesas] = useState([]);
  const router = useRouter();

  // 🔹 Carregar mesas e pedidos do Supabase
  useEffect(() => {
    let isMounted = true;

    const carregarMesas = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("mesa_id, status");

      if (error) {
        console.error("Erro ao carregar mesas:", error);
        return;
      }

      const totalMesas = 10; // ajuste se tiver mais mesas
      const mesasAtualizadas = Array.from({ length: totalMesas }, (_, i) => {
        const mesaId = i + 1;
        const pedidoAberto = (data || []).some(
          (p) => p.mesa_id === mesaId && p.status === "aberto"
        );
        return {
          id: mesaId,
          status: pedidoAberto ? "aberto" : "livre",
        };
      });

      if (isMounted) setMesas(mesasAtualizadas);
    };

    // carga inicial
    carregarMesas();

    // 🔹 Realtime (INSERT/UPDATE/DELETE) -> recarrega lista
    const channel = supabase
      .channel("pedidos-change")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        carregarMesas
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos" },
        carregarMesas
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "pedidos" },
        carregarMesas
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMesaPress = (mesaId) => {
    router.push(`/mesa/${mesaId}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.mesasContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMesaPress(item.id)}
            activeOpacity={0.8}
            accessibilityLabel={`Mesa ${item.id}`}
            accessible
          >
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "timing", duration: 150 }}
              style={[
                styles.mesa,
                { width: ITEM_WIDTH },
                item.status === "aberto"
                  ? { backgroundColor: "green" } // 🟢 mesa com pedido
                  : { backgroundColor: Colors.gold }, // 🟡 mesa livre
              ]}
            >
              <Text
                style={[
                  styles.mesaText,
                  item.status === "aberto" && { color: Colors.white },
                ]}
              >
                Mesa {item.id}
              </Text>
            </MotiView>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  mesasContainer: {
    padding: 12,
    paddingBottom: 120,
    alignItems: "center",
  },
  mesa: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: ITEM_MARGIN / 2,
  },
  mesaText: {
    color: Colors.black,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Salao;
