// app/salao.tsx (ou onde estiver seu componente Salao)

import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
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

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 12;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const Salao = () => {
  const [mesas, setMesas] = useState(
    Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
  );

  const router = useRouter();

  const adicionarMesa = () => {
    setMesas((prev) => [...prev, { id: prev.length + 1 }]);
  };

  const handleMesaPress = (mesaId: number) => {
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
              style={[styles.mesa, { width: ITEM_WIDTH }]}
            >
              <Text style={styles.mesaText}>Mesa {item.id}</Text>
            </MotiView>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={adicionarMesa}>
        <AntDesign name="plus" size={32} color={Colors.white} />
      </TouchableOpacity>
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
