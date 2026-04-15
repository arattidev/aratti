import { describe, expect, it, vi } from "vitest";

import { fetchBackend } from "./backend-api";

describe("fetchBackend", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hello: "world" }),
      }),
    );

    const data = await fetchBackend<{ hello: string }>("/health");
    expect(data.hello).toBe("world");
  });

  it("throws on failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "boom",
      }),
    );

    await expect(fetchBackend("/health")).rejects.toThrow("Backend request failed");
  });
});
