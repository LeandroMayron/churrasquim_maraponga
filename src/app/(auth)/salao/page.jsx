import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import dayjs from "dayjs";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function Salao() {
  const [mesas, setMesas] = useState([]);
  const router = useRouter();

  const carregarMesas = async () => {
    const { data: mesasExtras } = await supabase
      .from("mesas")
      .select("*")
      .order("numero");

    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("mesa_id,status");

    // Mesas fixas 1-20
    const mesasFixas = Array.from({ length: 20 }, (_, i) => {
      const mesaNumber = i + 1;
      const pedidoAberto = pedidos?.find(
        (p) =>
          Number(p.mesa_id) === mesaNumber &&
          p.status?.toLowerCase() === "aberto"
      );
      return {
        id: mesaNumber,
        numero: mesaNumber,
        status: pedidoAberto ? "aberto" : "livre",
      };
    });

    // Filtrar mesas extras que não expiraram (6h)
    const mesasExtrasValidas =
      mesasExtras
        ?.filter((m) => dayjs().diff(dayjs(m.criado_em), "hour") < 6)
        .map((m) => {
          const pedidoAberto = pedidos?.find(
            (p) =>
              Number(p.mesa_id) === m.numero &&
              p.status?.toLowerCase() === "aberto"
          );
          return { ...m, status: pedidoAberto ? "aberto" : "livre" };
        }) || [];

    setMesas([...mesasFixas, ...mesasExtrasValidas]);
  };

  useEffect(() => {
    carregarMesas();

    const channel = supabase
      .channel("pedidos-change")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        carregarMesas
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const adicionarMesa = async () => {
    const mesasExtras = mesas.filter((m) => m.numero > 20);
    const novoNumero = 21 + mesasExtras.length;

    try {
      await supabase
        .from("mesas")
        .insert([
          {
            nome: `Mesa ${novoNumero}`,
            numero: novoNumero,
            criado_em: new Date().toISOString(),
          },
        ]);
      carregarMesas(); // recarrega para atualizar a lista com a nova mesa
    } catch (err) {
      console.error("Erro ao criar mesa:", err);
    }
  };

  const handleMesaPress = (mesaId) => router.push(`/mesa/${mesaId}`);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.numero.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.mesasContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMesaPress(item.numero)}
            activeOpacity={0.8}
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
                Mesa {item.numero}
              </Text>
            </MotiView>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={adicionarMesa}>
        <AntDesign name="plus" size={32} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  mesasContainer: { padding: 12, paddingBottom: 120, alignItems: "center" },
  mesa: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: ITEM_MARGIN / 2,
  },
  mesaText: { color: Colors.black, fontWeight: "bold", fontSize: 16 },
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
