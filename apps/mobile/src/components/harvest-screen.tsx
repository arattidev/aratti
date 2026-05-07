import type { ReactNode } from "react";
import { ScrollView, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../theme";

interface HarvestScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export function HarvestScreen({ children, style, scrollable = true }: HarvestScreenProps) {
  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]} edges={["top", "left", "right"]}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.xl,
  },
});
