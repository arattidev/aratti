import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

interface TopNavProps {
  title: string;
  leftLabel?: string;
  rightLabel?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function TopNav({ title, leftLabel, rightLabel, onLeftPress, onRightPress }: TopNavProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onLeftPress} style={styles.iconSlot}>
        <Text style={styles.iconText}>{leftLabel ?? ""}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onRightPress} style={styles.iconSlot}>
        <Text style={styles.iconText}>{rightLabel ?? ""}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 40,
    letterSpacing: -0.6,
  },
  iconSlot: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  iconText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 18,
  },
});
