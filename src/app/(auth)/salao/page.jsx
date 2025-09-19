// app/salao.tsx

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
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase"; // ajuste se necessário

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;


const Salao = () => {
  const [mesas, setMesas] = useState([]);
  const router = useRouter();

  // Carregar mesas do Supabase
  const carregarMesas = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("mesa_id, status");

    if (!error && data) {
      const totalMesas = mesas.length > 0 ? mesas.length : 20;
      const mesasAtualizadas = Array.from({ length: totalMesas }, (_, i) => {
        const mesaId = i + 1;
        const pedidoAberto = data.find(
          (p) =>
            Number(p.mesa_id) === mesaId &&
            p.status?.toLowerCase().trim() === "aberto"
        );
        return {
          id: mesaId,
          status: pedidoAberto ? "aberto" : "livre",
        };
      });
      setMesas(mesasAtualizadas);
    }
  };

  useEffect(() => {
    carregarMesas();

    // Atualização em tempo real
    const channel = supabase
      .channel("pedidos-change")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          carregarMesas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const adicionarMesa = () => {
    setMesas((prev) => [...prev, { id: prev.length + 1, status: "livre" }]);
  };

  const handleMesaPress = (mesaId) => {
    router.push(`/mesa/${mesaId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
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
                  ? { backgroundColor: Colors.acafrao }
                  : { backgroundColor: Colors.gold },
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

      {/* Botão flutuante para adicionar mesa */}
      <TouchableOpacity style={styles.fab} onPress={adicionarMesa}>
        <AntDesign name="plus" size={32} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
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
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: Colors.acafrao,
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});

export default Salao;
