import { Stack } from "expo-router";

export default function mainLayout() {
    return (
        <Stack>
            <Stack.Screen 
            name="index" 
            options={{ headerShown: false }} />

            <Stack.Screen 
            name="(auth)/signup/page" 
            options={{ headerShown: false }} />

            <Stack.Screen 
            name="(painel)/profile/page" 
            options={{ headerShown: false }} />

            <Stack.Screen 
            name="(auth)/salao/page"
            options={{ headerShown: false }} />

            <Stack.Screen
            name="(auth)/cardapio/page"
            options={{ headerShown: false }} />
        </Stack>

        
    )
}