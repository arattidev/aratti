import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage } from "../lib/mmkv";

interface SessionState {
  userId: string | null;
  role: "USER" | "BUSINESS" | "BUSINESS_OWNER" | "BUSINESS_STAFF" | "ADMIN" | null;
  isOnboarded: boolean;
  setSession: (payload: { userId: string; role: SessionState["role"] }) => void;
  clearSession: () => void;
  completeOnboarding: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      isOnboarded: false,
      setSession: (payload) =>
        set({
          userId: payload.userId,
          role: payload.role,
        }),
      clearSession: () =>
        set({
          userId: null,
          role: null,
        }),
      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    {
      name: "aratti-session",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        isOnboarded: state.isOnboarded,
      }),
    },
  ),
);
