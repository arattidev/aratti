import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

interface ImpactPulseBadgeProps {
  text: string;
}

export function ImpactPulseBadge({ text }: ImpactPulseBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: theme.colors.secondary,
  },
  text: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
});
