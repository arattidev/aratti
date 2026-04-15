import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { SectionTitle } from "../../src/components/section-title";
import { SurfaceCard } from "../../src/components/surface-card";
import { useOrderHistory } from "../../src/hooks/use-order-history";
import { theme } from "../../src/theme";

const tabs: Array<"active" | "past" | "cancelled"> = ["active", "past", "cancelled"];

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("active");
  const historyQuery = useOrderHistory(activeTab);

  return (
    <HarvestScreen>
      <SectionTitle title="Tus pedidos" />

      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {historyQuery.data?.data && historyQuery.data.data.length > 0 ? (
        historyQuery.data.data.map((order, index) => (
          <SurfaceCard key={index}>
            <Text style={styles.orderTitle}>Pedido #{(order as { orderNumber?: string }).orderNumber ?? "---"}</Text>
            <Text style={styles.orderMeta}>{(order as { status?: string }).status ?? ""}</Text>
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard elevated={false}>
          <Text style={styles.empty}>Todavía no tenés pedidos en esta sección.</Text>
        </SurfaceCard>
      )}
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  tab: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tabText: {
    color: "#636466",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: theme.colors.onPrimary,
  },
  orderTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 22,
  },
  orderMeta: {
    color: theme.colors.secondary,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  empty: {
    color: "#676767",
    fontFamily: theme.typography.fontFamily,
    fontSize: 17,
  },
});
