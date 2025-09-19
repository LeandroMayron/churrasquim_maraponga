import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase"; // ajuste o caminho se necessário
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao sair:", error);
      return;
    }
    // redireciona para login
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Deseja sair da conta?</Text>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={Colors.gold}
          style={{ alignSelf: "center", marginTop: 8 }}
        />
      </Pressable>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black,
  },
  title: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
    backButton: {
      position: "absolute",
      width: 40,
      height: 40,
      top: 440,
      left: 80,
      alignSelf: "center",
      borderRadius: 8,
      zIndex: 0,
      backgroundColor: Colors.acafrao,
    },
  button: {
    backgroundColor: Colors.acafrao,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
