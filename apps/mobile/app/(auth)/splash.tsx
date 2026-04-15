import { useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { theme } from "../../src/theme";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>HARVEST</Text>
      <Text style={styles.subtitle}>Rescatá comida. Salvá el planeta.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 48,
    letterSpacing: -1,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
