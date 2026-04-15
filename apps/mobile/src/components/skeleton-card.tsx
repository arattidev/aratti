import { StyleSheet, View } from "react-native";

import { theme } from "../theme";

export function SkeletonCard() {
  return <View style={styles.block} />;
}

const styles = StyleSheet.create({
  block: {
    width: 280,
    height: 280,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surfaceContainerHigh,
    marginRight: theme.spacing.lg,
  },
});
