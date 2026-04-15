import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { SectionTitle } from "../../src/components/section-title";
import { SurfaceCard } from "../../src/components/surface-card";
import { useLocationStore } from "../../src/stores/location-store";
import { theme } from "../../src/theme";

const filterPresets = ["<2 km", "Panadería", "<$2.500", "Retirá hoy"];

export default function SearchScreen() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const cityLabel = useLocationStore((state) => state.cityLabel);

  return (
    <HarvestScreen>
      <SectionTitle title="Search" actionLabel={cityLabel.toUpperCase()} />

      <TextInput style={styles.searchInput} placeholder="¿Qué querés rescatar hoy?" placeholderTextColor="#737373" />

      <View style={styles.filterRow}>
        {filterPresets.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setActiveFilter(filter === activeFilter ? null : filter)}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      <SurfaceCard>
        <Text style={styles.blockTitle}>Map + list view</Text>
        <Text style={styles.blockBody}>
          Activá ubicación para ordenar por distancia real, categoría, precio y ventana de retiro.
        </Text>
      </SurfaceCard>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    minHeight: 62,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 20,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  filterChip: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  filterText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 15,
  },
  filterTextActive: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontFamilyBold,
  },
  blockTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 26,
  },
  blockBody: {
    color: "#4e4e4e",
    fontFamily: theme.typography.fontFamily,
    fontSize: 17,
    lineHeight: 26,
    marginTop: theme.spacing.md,
  },
});
