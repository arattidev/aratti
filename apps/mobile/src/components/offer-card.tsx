import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";
import type { OfferCard } from "@aratti/types";

interface OfferCardProps {
  offer: OfferCard;
  onPress: () => void;
}

export function OfferCard({ offer, onPress }: OfferCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: offer.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.overlayBadge}>
        <Text style={styles.overlayBadgeText}>RESCATA -{Math.round((1 - offer.rescuePriceArs / offer.originalPriceArs) * 100)}%</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.business}>{offer.businessName}</Text>
        <Text style={styles.title}>{offer.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${offer.rescuePriceArs.toLocaleString("es-AR")}</Text>
          <Text style={styles.originalPrice}>${offer.originalPriceArs.toLocaleString("es-AR")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 286,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radii.xl,
    overflow: "hidden",
    marginRight: theme.spacing.lg,
  },
  image: {
    width: "100%",
    height: 168,
  },
  overlayBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  overlayBadgeText: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: "700",
    fontSize: 12,
    color: theme.colors.onPrimary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  business: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.secondary,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
    fontSize: 33,
    fontWeight: "700",
    lineHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  price: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: "700",
  },
  originalPrice: {
    fontFamily: theme.typography.fontFamily,
    color: "#7a7a7a",
    fontSize: 18,
    textDecorationLine: "line-through",
  },
});
