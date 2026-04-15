import type { AnalyticsEventName } from "@aratti/types";

export interface AnalyticsClient {
  track: (event: AnalyticsEventName, properties?: Record<string, unknown>) => void;
}

export function createNoopAnalyticsClient(): AnalyticsClient {
  return {
    track: () => {
      // Intentionally noop in local dev when analytics providers are not configured.
    },
  };
}
