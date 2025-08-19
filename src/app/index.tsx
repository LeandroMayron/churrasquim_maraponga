import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Link } from "expo-router";
import { useState } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/(painel)/profile/page");
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logoSemFundo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Digite seu email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Ionicons
            name="eye-off"
            size={24}
            color={colors.gold}
            style={{ position: "absolute", right: 16, top: 38 }}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>
        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>
        <Link href="/(auth)/signup/page" style={styles.link}>
          <Text>Ainda não possui conta? Cadastre-se</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    paddingTop: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 200,
    marginBottom: 20,
  },

  form: {
    height: 280,
    backgroundColor: colors.acafrao,
    borderRadius: 16,
    paddingTop: 24,
    paddingLeft: 14,
    paddingRight: 14,
  },

  label: {
    color: colors.gold,
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  button: {
    backgroundColor: colors.gold,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },

  buttonText: {
    color: colors.acafrao,
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    alignItems: "center",
    justifyContent: "center",
    color: colors.gray,
    textDecorationLine: "underline",
  },
});
