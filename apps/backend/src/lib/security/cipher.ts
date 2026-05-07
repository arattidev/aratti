import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { env } from "../env";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const CIPHER_VERSION = "v1";

function deriveKey(secret: string): Buffer {
  // Derive a deterministic 32-byte key from SESSION_ENCRYPTION_KEY so the
  // operator can rotate the secret without managing key sizes manually.
  return createHash("sha256").update(secret).digest();
}

function getKey(): Buffer {
  const secret = env.SESSION_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_ENCRYPTION_KEY is required to encrypt secrets (min 16 chars)");
  }
  return deriveKey(secret);
}

export function encryptSecret(plain: string): string {
  if (!plain) {
    throw new Error("Cannot encrypt empty string");
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [CIPHER_VERSION, iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(payload: string): string {
  if (!payload) {
    throw new Error("Cannot decrypt empty payload");
  }

  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== CIPHER_VERSION) {
    throw new Error("Invalid cipher payload format");
  }

  const iv = Buffer.from(parts[1]!, "base64");
  const authTag = Buffer.from(parts[2]!, "base64");
  const ciphertext = Buffer.from(parts[3]!, "base64");

  if (iv.length !== IV_LENGTH_BYTES) {
    throw new Error("Invalid IV length");
  }

  if (authTag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("Invalid auth tag length");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
