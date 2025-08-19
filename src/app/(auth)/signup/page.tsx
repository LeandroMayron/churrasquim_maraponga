import { useState } from "react";
import colors from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";

const backgroundImage = require("./../../../../assets/images/logoSemFundo.png");

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace('/')
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.gold}
              style={{ alignSelf: "center", marginTop: 8 }}
            />
          </Pressable>
          <View style={styles.form}>
            <Image
              source={backgroundImage}
              style={styles.waterMark}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                placeholder="Digite seu Nome"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

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
                secureTextEntry={!showPassword}
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

            <Pressable
              style={[
                styles.button,
                (!name || !email || !password) && { opacity: 0.5 },
              ]}
              onPress={handleSignUp}
              disabled={!name || !email || !password}
            >
              <Text style={styles.buttonText}>
                {loading ? "Carregando..." : "Cadastrar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    width: 40,
    height: 40,
    top: 150,
    left: 0,
    alignSelf: "center",
    borderRadius: 8,
    zIndex: 0,
    backgroundColor: colors.acafrao,
  },

  form: {
    marginTop: -60,
    backgroundColor: colors.acafrao,
    padding: 16,
    borderRadius: 16,
    paddingTop: 24,
    paddingLeft: 14,
    paddingRight: 14,
  },

  waterMark: {
    position: "absolute",
    top: "25%",
    left: "10%",
    width: "80%",
    height: "50%",
    opacity: 0.3,
    zIndex: 0,
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
});
