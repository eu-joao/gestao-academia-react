import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#F8FAFC");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="treinos" />
    </Stack>
  );
}
