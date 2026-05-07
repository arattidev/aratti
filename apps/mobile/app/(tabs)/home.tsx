import { useMemo } from "react";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { OfferCard } from "../../src/components/offer-card";
import { SectionTitle } from "../../src/components/section-title";
import { SkeletonCard } from "../../src/components/skeleton-card";
import { SurfaceCard } from "../../src/components/surface-card";
import { TopNav } from "../../src/components/top-nav";
import { APP_STRINGS } from "../../src/lib/constants";
import { categories, fallbackOffers, homeStats } from "../../src/mocks/home-data";
import { useNearbyOffers } from "../../src/hooks/use-nearby-offers";
import { useLocationStore } from "../../src/stores/location-store";
import { theme } from "../../src/theme";

export default function HomeScreen() {
  const lat = useLocationStore((state) => state.lat) ?? -34.6037;
  const lng = useLocationStore((state) => state.lng) ?? -58.3816;
  const cityLabel = useLocationStore((state) => state.cityLabel);

  const nearbyQuery = useNearbyOffers({ lat, lng });

  const offers = useMemo(() => {
    if (nearbyQuery.data?.data?.length) {
      return nearbyQuery.data.data;
    }

    return fallbackOffers;
  }, [nearbyQuery.data?.data]);

  return (
    <HarvestScreen>
      <TopNav title="HARVEST" leftLabel="::" rightLabel="YO" />

      <Text style={styles.hero}>{APP_STRINGS.heroClaim}</Text>

      <View style={styles.searchWrap}>
        <TextInput style={styles.searchInput} placeholder={APP_STRINGS.searchPlaceholder} placeholderTextColor="#777" />
      </View>

      <View style={styles.statsRow}>
        {homeStats.map((stat) => (
          <SurfaceCard
            key={stat.key}
            style={[styles.statCard, stat.tone === "primary" ? styles.primaryStat : undefined]}
            elevated={stat.tone !== "primary"}
          >
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </SurfaceCard>
        ))}
      </View>

      <View>
        <Text style={styles.miniTitle}>Categorías</Text>
        <FlashList
          horizontal
          data={categories}
          keyExtractor={(category) => category}
          estimatedItemSize={100}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
          ItemSeparatorComponent={() => <View style={styles.horizontalSeparator} />}
          renderItem={({ item: category }) => (
            <Pressable style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </Pressable>
          )}
        />
      </View>

      <SectionTitle title="Ofertas de Hoy" actionLabel="Ver todo" />

      <FlashList
        horizontal
        data={nearbyQuery.isLoading ? [1, 2] : offers}
        keyExtractor={(item) => (typeof item === "number" ? `skeleton-${item}` : item.id)}
        estimatedItemSize={280}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.horizontalSeparator} />}
        renderItem={({ item }) =>
          typeof item === "number" ? (
            <SkeletonCard />
          ) : (
            <OfferCard
              offer={item}
              onPress={() => {
                router.push(`/offer/${item.id}`);
              }}
            />
          )
        }
      />

      <SectionTitle title="Cerca de Vos" actionLabel={cityLabel.toUpperCase()} />
      <SurfaceCard style={styles.mapCard} elevated={false}>
        <Text style={styles.mapBig}>12 TIENDAS</Text>
        <Text style={styles.mapCopy}>A menos de 15 minutos</Text>
      </SurfaceCard>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.2,
    marginTop: theme.spacing.lg,
  },
  searchWrap: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 62,
    justifyContent: "center",
  },
  searchInput: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minHeight: 140,
    justifyContent: "space-between",
  },
  primaryStat: {
    backgroundColor: theme.colors.primaryContainer,
  },
  statValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 52,
  },
  statLabel: {
    color: "#525252",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  miniTitle: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: theme.spacing.lg,
  },
  categoriesRow: {
    paddingRight: theme.spacing.lg,
  },
  horizontalSeparator: {
    width: theme.spacing.md,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.radii.lg,
  },
  categoryText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  mapCard: {
    minHeight: 240,
    justifyContent: "flex-end",
    backgroundColor: "#1f4852",
    gap: theme.spacing.sm,
  },
  mapBig: {
    color: "#d9ffff",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  mapCopy: {
    color: "#ffffff",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 34,
    lineHeight: 38,
  },
});
