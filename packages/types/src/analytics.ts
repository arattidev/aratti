export const analyticsEventNames = [
  "signup_completed",
  "offer_viewed",
  "checkout_started",
  "payment_success",
  "pickup_completed",
  "business_offer_created",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export interface AnalyticsEvent<TPayload = Record<string, unknown>> {
  name: AnalyticsEventName;
  userId?: string;
  anonymousId?: string;
  timestamp: string;
  payload: TPayload;
}
