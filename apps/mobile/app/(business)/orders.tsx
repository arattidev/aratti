import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { SurfaceCard } from "../../src/components/surface-card";
import { mobileApi } from "../../src/lib/api-client";
import { theme } from "../../src/theme";

export default function BusinessOrdersScreen() {
  const query = useQuery({
    queryKey: ["business-orders"],
    queryFn: () => mobileApi.getBusinessOrders({ limit: 20 }),
  });

  return (
    <HarvestScreen>
      <Text style={styles.title}>Órdenes del local</Text>
      {query.data?.data?.length ? (
        query.data.data.map((order) => (
          <SurfaceCard key={order.orderNumber}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.status}>{order.status}</Text>
            <Text style={styles.amount}>${order.totalArs.toLocaleString("es-AR")}</Text>
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard elevated={false}>
          <Text style={styles.empty}>No hay órdenes por ahora.</Text>
        </SurfaceCard>
      )}
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.section,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 48,
  },
  orderNumber: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 24,
  },
  status: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
  },
  amount: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 28,
  },
  empty: {
    color: "#5c5c5c",
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
  },
});
