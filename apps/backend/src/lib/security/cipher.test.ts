import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("cipher", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SESSION_ENCRYPTION_KEY = ENV_KEY;
    process.env.DATABASE_URL = "postgresql://x:y@z/aratti";
    process.env.DIRECT_URL = "postgresql://x:y@z/aratti";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("round-trips the original secret", async () => {
    const { encryptSecret, decryptSecret } = await import("./cipher");
    const plain = "APP_USR-1234567890-secret-token";

    const cipher = encryptSecret(plain);

    expect(cipher).not.toContain(plain);
    expect(cipher.startsWith("v1:")).toBe(true);
    expect(decryptSecret(cipher)).toBe(plain);
  });

  it("produces a different ciphertext for the same input (random IV)", async () => {
    const { encryptSecret } = await import("./cipher");

    const a = encryptSecret("same-secret");
    const b = encryptSecret("same-secret");

    expect(a).not.toBe(b);
  });

  it("rejects payloads with a corrupted auth tag", async () => {
    const { encryptSecret, decryptSecret } = await import("./cipher");

    const cipher = encryptSecret("payload");
    const parts = cipher.split(":");
    parts[2] = Buffer.from("0".repeat(16)).toString("base64");
    const tampered = parts.join(":");

    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("rejects payloads encrypted with a different key", async () => {
    const { encryptSecret } = await import("./cipher");
    const cipher = encryptSecret("payload");

    process.env.SESSION_ENCRYPTION_KEY = `${ENV_KEY}-rotated`;
    vi.resetModules();
    const { decryptSecret } = await import("./cipher");

    expect(() => decryptSecret(cipher)).toThrow();
  });
});
