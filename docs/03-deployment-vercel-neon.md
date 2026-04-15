# Deployment Guide (Vercel + Neon)

## 1. Neon setup

1. Create Neon project and database.
2. Copy `DATABASE_URL` and `DIRECT_URL` into Vercel env vars.
3. Apply migrations from CI or once manually:

```bash
pnpm db:generate
pnpm db:migrate
```

4. Apply optional index optimization SQL:

```sql
-- run packages/db/prisma/sql/001_geo_and_desc_indexes.sql
```

## 2. Vercel projects

Create two Vercel projects:

- `aratti-backend` -> root `apps/backend`
- `aratti-web-admin` -> root `apps/web-admin`

## 3. Required env vars

Backend Vercel project:

- `DATABASE_URL`
- `DIRECT_URL`
- `CLERK_SECRET_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `API_BASE_URL`
- `APP_TIMEZONE=America/Argentina/Buenos_Aires`

Web-admin Vercel project:

- `NEXT_PUBLIC_API_BASE_URL`

Mobile (Expo/EAS env):

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`

## 4. Webhook configuration

Mercado Pago:

- Point webhook URL to: `https://<backend-domain>/api/webhooks/mercadopago`
- Configure secret and signature validation.

## 5. Observability

- Enable Sentry in both backend and mobile.
- Track business events:
  - signup_completed
  - offer_viewed
  - checkout_started
  - payment_success
  - pickup_completed
  - business_offer_created

## 6. Release workflow

1. Merge to `main`.
2. CI runs tests.
3. Prisma migration deploy step.
4. Vercel production deploy.
5. Smoke test:
   - nearby offers
   - create order
   - payment create
   - webhook transition
   - pickup confirmation
