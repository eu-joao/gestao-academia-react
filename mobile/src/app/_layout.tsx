import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="treinos/index" />
      <Stack.Screen name="treinos/novo" />
      <Stack.Screen name="treinos/[id]" />
    </Stack>
  );
}
