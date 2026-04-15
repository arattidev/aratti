import { describe, expect, it } from "vitest";

import { useSessionStore } from "./session-store";

describe("session store", () => {
  it("sets and clears session", () => {
    const state = useSessionStore.getState();

    state.setSession({
      userId: "user_1",
      role: "USER",
    });

    expect(useSessionStore.getState().userId).toBe("user_1");

    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().userId).toBeNull();
  });
});
