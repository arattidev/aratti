import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { SurfaceCard } from "../../src/components/surface-card";
import { theme } from "../../src/theme";

export default function BusinessDashboardScreen() {
  return (
    <HarvestScreen>
      <Text style={styles.title}>Dashboard Local</Text>

      <View style={styles.kpiRow}>
        <SurfaceCard style={styles.kpi}>
          <Text style={styles.kpiValue}>$82.400</Text>
          <Text style={styles.kpiLabel}>Ventas hoy</Text>
        </SurfaceCard>
        <SurfaceCard style={styles.kpi}>
          <Text style={styles.kpiValue}>37</Text>
          <Text style={styles.kpiLabel}>Packs vendidos</Text>
        </SurfaceCard>
      </View>

      <ImpactButton
        label="CREAR OFERTA"
        onPress={() => {
          router.push("/(business)/offers/new");
        }}
      />

      <Pressable style={styles.secondaryAction} onPress={() => router.push("/(business)/orders")}> 
        <Text style={styles.secondaryActionText}>Ver órdenes</Text>
      </Pressable>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.section,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 52,
  },
  kpiRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  kpi: {
    flex: 1,
  },
  kpiValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 34,
  },
  kpiLabel: {
    marginTop: theme.spacing.sm,
    color: "#5a5a5a",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  secondaryAction: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  secondaryActionText: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
