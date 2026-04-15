import { create } from "zustand";

interface LocationState {
  lat: number | null;
  lng: number | null;
  cityLabel: string;
  setLocation: (payload: { lat: number; lng: number; cityLabel: string }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: -34.6037,
  lng: -58.3816,
  cityLabel: "Palermo, CABA",
  setLocation: (payload) =>
    set({
      lat: payload.lat,
      lng: payload.lng,
      cityLabel: payload.cityLabel,
    }),
}));
