export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export const APP_STRINGS = {
  appName: "HARVEST",
  heroClaim: "Rescata comida, salva el planeta",
  searchPlaceholder: "Que queres rescatar hoy?",
  reservePack: "RESERVAR PACK",
  confirmPayment: "CONFIRMAR PAGO",
} as const;
