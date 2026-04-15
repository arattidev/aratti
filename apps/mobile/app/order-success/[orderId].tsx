import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { SurfaceCard } from "../../src/components/surface-card";
import { theme } from "../../src/theme";

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams<{ orderId: string; pickupToken?: string }>();

  return (
    <HarvestScreen>
      <Animated.View entering={FadeInDown.duration(350)}>
        <Text style={styles.title}>Pago confirmado</Text>
        <Text style={styles.subtitle}>Tu pack fue reservado. Retirá hoy dentro del horario publicado.</Text>
      </Animated.View>

      <SurfaceCard style={styles.qrCard}>
        <Text style={styles.qrLabel}>Código QR de retiro</Text>
        <View style={styles.fakeQr}>
          <Text style={styles.fakeQrText}>QR</Text>
        </View>
        <Text style={styles.token}>{params.pickupToken ?? "token_no_disponible"}</Text>
      </SurfaceCard>

      <SurfaceCard elevated={false}>
        <Text style={styles.instructionsTitle}>Instrucciones</Text>
        <Text style={styles.instructions}>Mostrá este código al local para validar tu reserva.</Text>
        <Text style={styles.instructions}>Pedido: {params.orderId}</Text>
      </SurfaceCard>

      <ImpactButton
        label="VER TUS PEDIDOS"
        onPress={() => {
          router.replace("/(tabs)/orders");
        }}
      />
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.section,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: theme.spacing.md,
    color: "#555",
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    lineHeight: 28,
  },
  qrCard: {
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  qrLabel: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
  },
  fakeQr: {
    width: 180,
    height: 180,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  fakeQrText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 54,
  },
  token: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 16,
  },
  instructionsTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 24,
  },
  instructions: {
    color: "#4d4d4d",
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
  },
});
