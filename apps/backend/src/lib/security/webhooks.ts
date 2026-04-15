import { createHmac, timingSafeEqual } from "node:crypto";

import { HttpError } from "../errors";

export function verifyHmacSignature({
  payload,
  providedSignature,
  secret,
}: {
  payload: string;
  providedSignature: string | null;
  secret: string;
}): void {
  if (!providedSignature) {
    throw new HttpError(401, "invalid_signature", "Missing webhook signature");
  }

  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  const expected = Buffer.from(digest);
  const actual = Buffer.from(providedSignature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new HttpError(401, "invalid_signature", "Webhook signature mismatch");
  }
}
