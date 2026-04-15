import { StyleSheet, Text } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { SectionTitle } from "../../src/components/section-title";
import { SurfaceCard } from "../../src/components/surface-card";
import { theme } from "../../src/theme";

export default function FavoritesScreen() {
  return (
    <HarvestScreen>
      <SectionTitle title="Locales" actionLabel="Favoritos" />
      <SurfaceCard>
        <Text style={styles.title}>Seguí tus locales favoritos</Text>
        <Text style={styles.body}>Recibí alertas cuando publiquen nuevos packs para rescatar cerca tuyo.</Text>
      </SurfaceCard>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 32,
    lineHeight: 36,
  },
  body: {
    color: "#4e4e4e",
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.md,
    fontSize: 18,
    lineHeight: 28,
  },
});
