import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
}

export function SectionTitle({ title, actionLabel }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 40,
    letterSpacing: -0.5,
  },
  action: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
