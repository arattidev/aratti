import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { theme } from "../theme";

interface ImpactButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ImpactButton({ label, onPress, icon, style, disabled }: ImpactButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryFixedDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, disabled && styles.disabled]}
      >
        <Text style={styles.label}>{label}</Text>
        {icon}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: "700",
    fontSize: 22,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});
