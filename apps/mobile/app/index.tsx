import { Redirect } from "expo-router";

import { useSessionStore } from "../src/stores/session-store";

export default function IndexPage() {
  const userId = useSessionStore((state) => state.userId);
  const isOnboarded = useSessionStore((state) => state.isOnboarded);

  if (!isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!userId) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
