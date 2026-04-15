import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { theme } from "../theme";

interface SurfaceCardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function SurfaceCard({ children, style, elevated = true }: SurfaceCardProps) {
  return <View style={[styles.base, elevated ? styles.elevated : styles.flat, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  flat: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
});
