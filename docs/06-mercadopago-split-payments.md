# Mercado Pago Split Payments (Marketplace)

This guide covers the OAuth + split-preference integration that enables each
`Business` to receive payments directly while the platform retains a
configurable commission (`MARKETPLACE_COMMISSION_PERCENTAGE`).

## Architecture

```
apps/backend/app/api/mercadopago/{auth-url, oauth/callback, disconnect, verify-connection}
apps/backend/app/api/webhooks/mercadopago                     POST   payment + merchant_order
apps/backend/src/modules/mercadopago/                         repository + service + controller
apps/backend/src/lib/security/cipher.ts                       AES-256-GCM at-rest cipher
packages/payments/src/providers/mercado-pago.ts               OAuth + createSplitPreference
packages/db/prisma/schema.prisma::MercadoPagoAccount          tokens cifrados por business
```

## Required env (LIVE mode)

| Variable | Description |
| --- | --- |
| `PAYMENTS_MODE` | Set to `LIVE` to enable real Mercado Pago calls. |
| `MERCADO_PAGO_CLIENT_ID` | Marketplace app client id (also used as `marketplace=MP-MKT-<id>`). |
| `MERCADO_PAGO_CLIENT_SECRET` | OAuth client secret. |
| `MERCADO_PAGO_OAUTH_REDIRECT_URI` | `<your-domain>/api/mercadopago/oauth/callback`. |
| `MERCADO_PAGO_ACCESS_TOKEN` | Platform access token (used as fallback for unsigned requests). |
| `MERCADO_PAGO_WEBHOOK_SECRET` | HMAC secret for `x-signature` validation. |
| `MERCADO_PAGO_WEBHOOK_URL` | Public URL `<domain>/api/webhooks/mercadopago`. |
| `MERCADO_PAGO_SUCCESS_URL` / `_FAILURE_URL` / `_PENDING_URL` | Back-URLs for the buyer. |
| `MARKETPLACE_COMMISSION_PERCENTAGE` | Platform fee % over the order subtotal (default `2`). |
| `SESSION_ENCRYPTION_KEY` | Required to encrypt seller tokens at rest (>=16 chars). |

## Sandbox smoke test (Argentina)

1. Create a Marketplace application at <https://www.mercadopago.com.ar/developers/panel>
   and copy `Client ID` (also acts as the marketplace identifier),
   `Client Secret`, `Access Token` and `Public Key`.
2. Create two test users (`vendedor` and `comprador`) at
   <https://www.mercadopago.com.ar/developers/panel/test-users>.
3. In the application settings:
   - Add `Redirect URI`: `https://<your-cloudflare-tunnel>/api/mercadopago/oauth/callback`.
   - Configure webhook: `https://<your-cloudflare-tunnel>/api/webhooks/mercadopago`
     subscribing to `payment` and `merchant_order`. Copy the webhook secret to
     `MERCADO_PAGO_WEBHOOK_SECRET`.
4. Apply the Prisma migration: `pnpm db:migrate`. Set `PAYMENTS_MODE=LIVE`.
5. Run the backend: `pnpm --filter @aratti/backend dev`.
6. Connect the seller (logged in as a Business owner):
   - `GET /api/mercadopago/auth-url?businessId=<uuid>` returns `{ url, expiresAt }`.
   - Open the URL in a browser logged in with the test seller and authorize the
     scopes. The callback redirects to `MERCADO_PAGO_SUCCESS_URL` with
     `?status=connected&businessId=<uuid>`.
7. Verify: `GET /api/mercadopago/verify-connection?businessId=<uuid>` returns
   `{ connected: true, mpUserId, liveMode, expiresAt }` (no tokens leak).
8. Create an order as the buyer:
   `POST /api/orders { offerId, quantity, paymentProvider: "MERCADO_PAGO", idempotencyKey }`.
   The response includes `payment.checkoutUrl` (and `sandboxCheckoutUrl` while in
   sandbox).
9. Pay using the test card **APRO** Mastercard `5031 7557 3453 0604` CVV `123`
   exp `11/30`, holder `APRO` DNI `12345678`.
10. Verify state:
    - `Payment.status = SUCCEEDED`, `Order.status = CONFIRMED`.
    - `marketplaceFeeArs = round(subtotalArs * MARKETPLACE_COMMISSION_PERCENTAGE / 100)`.
    - `sellerAmountArs = totalArs - marketplaceFeeArs`.
    - The seller MP account shows the net credit; the platform MP account shows
      the `marketplace_fee` as income.
    - `audit_logs` contains `mp_account_connected`, `payment_intent_created`,
      `mp_webhook_processed`.
11. Negative cases:
    - Card holder `OTHE` (rejected) -> `Payment.status = FAILED`, order stays
      `PENDING_PAYMENT` until the cleanup cron times it out.
    - Disconnect: `POST /api/mercadopago/disconnect { businessId }` revokes the
      token via MP `unlink` and soft-deletes the row.

## Security checklist

- Seller `access_token` and `refresh_token` are encrypted with AES-256-GCM and
  the key is derived from `SESSION_ENCRYPTION_KEY` (`apps/backend/src/lib/security/cipher.ts`).
- The OAuth `state` is signed with HMAC-SHA256 and expires in 10 minutes,
  preventing CSRF on the callback.
- Webhook payloads must include `x-signature` and `x-request-id` and the HMAC
  is verified with `timingSafeEqual` before any side effect.
- `MERCADO_PAGO_CLIENT_SECRET` is server-only, never exposed via `NEXT_PUBLIC_*`.
- All sensitive lifecycle events (connect, refresh, disconnect, webhook) are
  written to `audit_logs`.

## Out of scope (next iterations)

- Multi-vendor cart with `disbursements` (when an `Order` can map to multiple
  `Business` rows).
- Partial refunds that also rebate the marketplace fee.
- Proactive cron job that refreshes seller tokens before they expire.
