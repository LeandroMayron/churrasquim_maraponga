// src/app/_layout.jsx
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ActivityIndicator, View } from "react-native";
import Colors from "@/constants/Colors";

export default function MainLayout() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Recupera sessão salva
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta login/logout
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace("/(painel)/profile/page");
      } else {
        router.replace("/");
      }
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.black,
        }}
      >
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.black },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="/" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)/signup/page"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(painel)/profile/page"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(auth)/salao/page" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)/cardapio/page"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(auth)/mesa/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)/logout/page"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
