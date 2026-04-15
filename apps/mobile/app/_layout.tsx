import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "../src/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="offer/[id]" />
        <Stack.Screen name="checkout/[offerId]" />
        <Stack.Screen name="order-success/[orderId]" />
        <Stack.Screen name="(business)" />
      </Stack>
    </AppProviders>
  );
}
