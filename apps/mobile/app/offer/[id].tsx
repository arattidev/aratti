import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { SurfaceCard } from "../../src/components/surface-card";
import { mobileApi } from "../../src/lib/api-client";
import { theme } from "../../src/theme";

export default function OfferDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();

  const offerQuery = useQuery({
    queryKey: ["offer", params.id],
    queryFn: () => mobileApi.getOfferById(params.id),
    enabled: Boolean(params.id),
  });

  const offer = offerQuery.data as
    | {
        id: string;
        title: string;
        description?: string;
        rescuePriceArs: number;
        quantityAvailable: number;
        pickupStartAt: string;
        pickupEndAt: string;
        images?: string[];
        business: { name: string; address: string };
      }
    | undefined;

  return (
    <HarvestScreen>
      <SurfaceCard style={styles.heroCard} elevated>
        <Image
          source={{
            uri:
              offer?.images?.[0] ??
              "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80",
          }}
          style={styles.heroImage}
          contentFit="cover"
        />

        <Text style={styles.heroTitle}>{offer?.title ?? "La Panadería de la Esquina"}</Text>
        <Text style={styles.heroMeta}>{offer?.business?.name ?? "Av. Santa Fe"}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionLabel}>Bolsa sorpresa</Text>
        <Text style={styles.description}>{offer?.description ?? "Rescatá una selección artesanal de facturas, panes de masa madre y croissants del día."}</Text>
      </SurfaceCard>

      <View style={styles.doubleRow}>
        <SurfaceCard style={styles.half}>
          <Text style={styles.smallLabel}>Recogida</Text>
          <Text style={styles.value}>19:00 - 20:00</Text>
        </SurfaceCard>
        <SurfaceCard style={[styles.half, styles.priceCard]}>
          <Text style={styles.smallLabel}>Precio</Text>
          <Text style={styles.value}>${offer?.rescuePriceArs?.toLocaleString("es-AR") ?? "1.200"}</Text>
        </SurfaceCard>
      </View>

      <SurfaceCard elevated={false}>
        <Text style={styles.sectionLabel}>Ubicación</Text>
        <Text style={styles.locationLine}>{offer?.business?.address ?? "Av. Santa Fe 2450"}</Text>
        <Text style={styles.locationSub}>Buenos Aires, Argentina</Text>
      </SurfaceCard>

      <ImpactButton
        label="RESERVAR PACK"
        onPress={() => {
          router.push(`/checkout/${params.id}`);
        }}
      />
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    overflow: "hidden",
    padding: 0,
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 46,
    lineHeight: 48,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  heroMeta: {
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 15,
    color: theme.colors.secondary,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionLabel: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: "#414141",
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    lineHeight: 28,
  },
  doubleRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  half: {
    flex: 1,
  },
  priceCard: {
    backgroundColor: theme.colors.primaryContainer,
  },
  smallLabel: {
    color: "#4c4c4c",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 34,
    marginTop: theme.spacing.md,
  },
  locationLine: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 20,
  },
  locationSub: {
    color: "#575757",
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    marginTop: theme.spacing.xs,
  },
});
