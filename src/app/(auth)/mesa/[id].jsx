// app/mesa/[id].tsx
import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Mesa() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa {id}</Text>
      <Text style={styles.subtitle}>
        Aqui vai ser a mesa com os pedidos do cliente
      </Text>
      {/* Adicione aqui a lista de pedidos */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
});
