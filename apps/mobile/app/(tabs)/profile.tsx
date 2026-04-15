import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { SectionTitle } from "../../src/components/section-title";
import { SurfaceCard } from "../../src/components/surface-card";
import { clearAuthToken } from "../../src/lib/secure-store";
import { useSessionStore } from "../../src/stores/session-store";
import { theme } from "../../src/theme";

export default function ProfileScreen() {
  const clearSession = useSessionStore((state) => state.clearSession);

  const onLogout = async () => {
    await clearAuthToken();
    clearSession();
    router.replace("/(auth)/sign-in");
  };

  return (
    <HarvestScreen>
      <SectionTitle title="Perfil" />

      <SurfaceCard>
        <Text style={styles.heading}>Configuración</Text>
        <View style={styles.list}>
          <Text style={styles.item}>Métodos de pago</Text>
          <Text style={styles.item}>Soporte</Text>
          <Text style={styles.item}>Notificaciones push</Text>
          <Text style={styles.item}>Payout settings</Text>
        </View>
      </SurfaceCard>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </Pressable>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 30,
    marginBottom: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
  item: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
  },
  logoutButton: {
    minHeight: 56,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
});
