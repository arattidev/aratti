import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { ImpactPulseBadge } from "../../src/components/impact-pulse-badge";
import { SurfaceCard } from "../../src/components/surface-card";
import { useCreateOrder } from "../../src/hooks/use-create-order";
import { mobileApi } from "../../src/lib/api-client";
import { theme } from "../../src/theme";

const methods = [
  { key: "APPLE_PAY", label: "Apple Pay" },
  { key: "MERCADO_PAGO", label: "Mercado Pago" },
  { key: "STRIPE", label: "Tarjeta de Crédito" },
] as const;

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ offerId: string }>();
  const [selectedMethod, setSelectedMethod] = useState<(typeof methods)[number]["key"]>("APPLE_PAY");

  const createOrder = useCreateOrder();

  const offerQuery = useQuery({
    queryKey: ["offer", params.offerId],
    queryFn: () => mobileApi.getOfferById(params.offerId),
    enabled: Boolean(params.offerId),
  });

  const offer = offerQuery.data as
    | {
        id: string;
        title: string;
        rescuePriceArs: number;
        originalPriceArs: number;
      }
    | undefined;

  const savings = useMemo(() => {
    if (!offer) {
      return 0;
    }
    return offer.originalPriceArs - offer.rescuePriceArs;
  }, [offer]);

  const total = offer?.rescuePriceArs ?? 1250;

  const onConfirmPayment = async () => {
    const idempotencyKey = `mobile_${Date.now()}_${Math.round(Math.random() * 10000)}`;

    const order = await createOrder.mutateAsync({
      offerId: params.offerId,
      quantity: 1,
      paymentProvider: selectedMethod,
      idempotencyKey,
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/order-success/[orderId]",
      params: {
        orderId: order.orderId,
        pickupToken: order.pickupToken ?? "",
      },
    });
  };

  return (
    <HarvestScreen>
      <Text style={styles.title}>Finalizá tu compra</Text>
      <ImpactPulseBadge text="Conexión encriptada de alta seguridad" />

      <SurfaceCard>
        <Text style={styles.cardHeadline}>Resumen del pedido</Text>
        <Text style={styles.offerTitle}>{offer?.title ?? "1x Bolsa Sorpresa Mixta"}</Text>
        <Text style={styles.price}>${total.toLocaleString("es-AR")}</Text>
      </SurfaceCard>

      <View style={styles.methodList}>
        {methods.map((method) => (
          <Pressable
            key={method.key}
            style={[styles.methodCard, selectedMethod === method.key && styles.methodCardActive]}
            onPress={() => setSelectedMethod(method.key)}
          >
            <Text style={[styles.methodText, selectedMethod === method.key && styles.methodTextActive]}>{method.label}</Text>
            <View style={[styles.radio, selectedMethod === method.key && styles.radioActive]} />
          </Pressable>
        ))}
      </View>

      <SurfaceCard style={styles.summaryDark} elevated={false}>
        <Text style={styles.summaryLabel}>Total a pagar</Text>
        <Text style={styles.summaryPrice}>${total.toLocaleString("es-AR")}</Text>
        <Text style={styles.summarySave}>Ahorrás ${savings.toLocaleString("es-AR")}</Text>
      </SurfaceCard>

      <ImpactButton label="CONFIRMAR PAGO" onPress={onConfirmPayment} disabled={createOrder.isPending} />
      <Text style={styles.terms}>Al confirmar, aceptás nuestros términos de servicio y políticas de rescate.</Text>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 54,
    lineHeight: 56,
    letterSpacing: -1,
    marginTop: theme.spacing.xl,
  },
  cardHeadline: {
    color: "#505154",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  offerTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 38,
    lineHeight: 42,
  },
  price: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 40,
  },
  methodList: {
    gap: theme.spacing.md,
  },
  methodCard: {
    minHeight: 64,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
  },
  methodCardActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  methodText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 26,
  },
  methodTextActive: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontFamilyBold,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#a3a3a3",
  },
  radioActive: {
    borderColor: theme.colors.onPrimary,
    backgroundColor: theme.colors.onPrimary,
  },
  summaryDark: {
    backgroundColor: "#021017",
  },
  summaryLabel: {
    color: "#adb2b4",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryPrice: {
    marginTop: theme.spacing.sm,
    color: "#ffffff",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 72,
    letterSpacing: -1.2,
  },
  summarySave: {
    marginTop: theme.spacing.sm,
    color: "#8dedec",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 22,
  },
  terms: {
    color: "#636363",
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
