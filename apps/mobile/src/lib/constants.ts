function normalizeApiBaseUrl(value: string | undefined): string {
  const fallback = "http://localhost:3000";
  const raw = value?.trim() || fallback;

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `http://${raw}`;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

export const APP_STRINGS = {
  appName: "HARVEST",
  heroClaim: "Rescata comida, salva el planeta",
  searchPlaceholder: "Que queres rescatar hoy?",
  reservePack: "RESERVAR PACK",
  confirmPayment: "CONFIRMAR PAGO",
} as const;
