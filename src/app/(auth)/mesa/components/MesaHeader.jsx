import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function MesaHeader({ mesaId }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Mesa {mesaId}</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.background,
  },
  title: { fontSize: 18, fontWeight: "bold", color: Colors.text },
});
