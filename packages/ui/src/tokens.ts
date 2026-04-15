export const harvestColors = {
  primary: "#6c5a00",
  primaryContainer: "#ffd709",
  primaryFixedDim: "#efc900",
  secondary: "#006666",
  secondaryContainer: "#8dedec",
  tertiary: "#5c5b5b",
  background: "#f5f6f7",
  surface: "#f5f6f7",
  surfaceContainerLow: "#eff1f2",
  surfaceContainer: "#e6e8ea",
  surfaceContainerHigh: "#e0e3e4",
  surfaceContainerHighest: "#dadddf",
  surfaceContainerLowest: "#ffffff",
  text: "#18181b",
  onPrimary: "#453900",
  onSecondary: "#003737",
  outlineVariant: "#abadae",
  error: "#dc2626",
} as const;

export const harvestRadii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
} as const;

export const harvestSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 64,
  chapter: 80,
} as const;

export const harvestTypography = {
  fontFamily: "SpaceGrotesk",
  displayLg: {
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1,
    fontWeight: "700",
  },
  headlineLg: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    fontWeight: "700",
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: "400",
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
} as const;
