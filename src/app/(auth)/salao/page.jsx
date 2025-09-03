import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase"; // ajuste se necessário
import Colors from "@/constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const Salao = () => {
  const router = useRouter();
  const [mesas, setMesas] = useState([]);

  // Carregar mesas do Supabase
  const carregarMesas = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("mesa_id, status");
    if (!error && data) {
      const totalMesas = mesas.length > 0 ? mesas.length : 10;
      const mesasAtualizadas = Array.from({ length: totalMesas }, (_, i) => {
        const mesaId = i + 1;
        const pedidoAberto = data.find(
          (p) => Number(p.mesa_id) === mesaId && p.status === "aberto"
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

  const handleMesaPress = (mesaId) => {
    router.push(`/mesa/${mesaId}`);
  };

  const adicionarMesa = () => {
    const novaMesaId = mesas.length + 1;
    setMesas([...mesas, { id: novaMesaId, status: "livre" }]);
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
                item.status === "aberto" && { backgroundColor: Colors.acafrao },
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

      {/* Botão + para adicionar mesa */}
      <TouchableOpacity style={styles.addButton} onPress={adicionarMesa}>
        <AntDesign name="plus" size={28} color={Colors.acafrao} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 16,
  },
  mesasContainer: {
    padding: ITEM_MARGIN,
    alignItems: "center",
    paddingBottom: 120,
  },
  mesa: {
    backgroundColor: Colors.gold,
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
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: Colors.gold,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default Salao;
