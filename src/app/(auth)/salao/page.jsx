import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Salao = () => {
  const [mesas, setMesas] = useState(
    Array.from({ length: 10 }, (_, i) => i + 1)
  );

  const adicionarMesa = () => {
    setMesas([...mesas, mesas.length + 1]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.toString()}
        numColumns={4} // força 4 mesas por linha
        contentContainerStyle={styles.mesasContainer}
        renderItem={({ item }) => (
          <View style={styles.mesa}>
            <Text style={styles.mesaText}>Mesa {item}</Text>
          </View>
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
    justifyContent: "center",
  },
  mesasContainer: {
    padding: 16,
  },
  mesa: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // divide igualmente o espaço
    margin: 6,
    minWidth: 60,
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
