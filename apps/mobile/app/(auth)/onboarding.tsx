import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { ImpactPulseBadge } from "../../src/components/impact-pulse-badge";
import { APP_STRINGS } from "../../src/lib/constants";
import { useSessionStore } from "../../src/stores/session-store";
import { theme } from "../../src/theme";

export default function OnboardingScreen() {
  const completeOnboarding = useSessionStore((state) => state.completeOnboarding);

  return (
    <HarvestScreen>
      <View style={styles.heroWrap}>
        <Text style={styles.hero}>{APP_STRINGS.heroClaim}</Text>
        <ImpactPulseBadge text="Movimiento activo de rescate" />
      </View>

      <View style={styles.storyBlock}>
        <Text style={styles.storyTitle}>Unite al movimiento de rescate</Text>
        <Text style={styles.storyBody}>
          Comprá packs sorpresa de panaderías, cafeterías y restaurantes cerca tuyo. Retirá hoy y ahorrá mientras evitás desperdicio.
        </Text>
      </View>

      <ImpactButton
        label="EMPEZAR"
        onPress={() => {
          completeOnboarding();
          router.replace("/(auth)/sign-in");
        }}
      />
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: theme.spacing.chapter,
    gap: theme.spacing.lg,
  },
  hero: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.2,
  },
  storyBlock: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  storyTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.7,
  },
  storyBody: {
    color: "#353535",
    fontFamily: theme.typography.fontFamily,
    fontSize: 18,
    lineHeight: 30,
  },
});
