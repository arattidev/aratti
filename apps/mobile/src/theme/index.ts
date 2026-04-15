import { harvestColors, harvestMotion, harvestRadii, harvestSpacing, harvestTypography } from "@aratti/ui";

export const theme = {
  colors: harvestColors,
  radii: harvestRadii,
  spacing: harvestSpacing,
  typography: {
    ...harvestTypography,
    fontFamily: "SpaceGrotesk_400Regular",
    fontFamilyMedium: "SpaceGrotesk_500Medium",
    fontFamilyBold: "SpaceGrotesk_700Bold",
  },
  motion: harvestMotion,
} as const;
