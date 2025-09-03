import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../../../lib/supabase"; // ajuste o caminho se necessário
import Colors from "@/constants/Colors";
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
    <View style={styles.container}>
      <Text style={styles.title}>Deseja sair da conta?</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
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
