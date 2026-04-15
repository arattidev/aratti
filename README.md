# Aratti MVP Monorepo

Marketplace mobile-first para rescate de comida en Argentina/LATAM (inspirado en Too Good To Go).

## Mission

- Rescatá comida de calidad antes de que se desperdicie
- Ayudá a locales a monetizar excedentes
- Compra rápida, confiable y segura desde mobile

## Product goals

- Fast reservations and checkout from mobile
- Simple publishing flow for businesses
- Trusted pickup with QR validation and anti-fraud controls
- Secure backend with auditable payments

## Stack

- Mobile: React Native + Expo Router + TypeScript
- Backend: Next.js API on Vercel + Prisma
- Web Console: Next.js web admin (business + platform admin)
- Database: Neon PostgreSQL
- Auth: Clerk (Apple, Google, Email OTP)
- Payments: Mercado Pago + Apple Pay abstraction, Stripe-ready
- State: Zustand + TanStack Query + MMKV + SecureStore
- Validation: Zod + React Hook Form
- Security: rate limit, signed webhooks, audit logs, authz by ownership

## Workspace layout

```text
apps/
  backend/      Next.js API (offers, orders, payments, business, admin, webhooks)
  mobile/       Expo app (user + business flows)
  web-admin/    Responsive web console (business/admin)
packages/
  api/          Shared Zod contracts + typed client
  auth/         Auth context, role guards, ownership checks
  db/           Prisma schema + Neon client + SQL index extras
  payments/     Provider interface + Mercado Pago + Apple Pay + Stripe-ready
  ui/           Kinetic Harvest tokens, spacing, motion
  types/        Shared domain and analytics event types
  notifications/ Notification abstractions
  analytics/    Analytics client abstractions
docs/
  01-system-architecture.md
  02-monorepo-structure.md
```

## Implemented API modules

- Auth: `/api/auth/login`
- Offers: `/api/offers/nearby`, `/api/offers/:id`
- Orders: `/api/orders`, `/api/orders/history`, `/api/orders/:id/pickup`
- Payments: `/api/payments/create`, `/api/webhooks/mercadopago`
- Business: `/api/business/offers`, `/api/business/offers/:id`, `/api/business/orders`
- Admin: `/api/admin/businesses/pending`, `/api/admin/refunds/:id/approve`, `/api/admin/fraud/flags`
- Notifications: `/api/notifications`

## Implemented mobile flows

- Auth: splash, onboarding, sign-in
- User: home feed, search filters, offer detail, checkout, order success, orders, favorites, profile
- Business: onboarding, dashboard, create offer, orders
- Design system: Techno-Agrarian Kinetic theme with Space Grotesk, tonal layering, yellow/teal high-contrast identity

## Local setup

1. Install dependencies:

	`pnpm install`

2. Copy env template and set secrets:

	`cp .env.example .env`

3. Generate Prisma client:

	`pnpm db:generate`

4. Run migrations:

	`pnpm db:migrate`

5. Run apps:

	`pnpm dev`

## Individual run commands

- Backend: `pnpm --filter @aratti/backend dev`
- Mobile: `pnpm --filter @aratti/mobile dev`
- Web admin: `pnpm --filter @aratti/web-admin dev`

## Testing

- All tests: `pnpm test`
- Backend tests: `pnpm --filter @aratti/backend test`
- Mobile tests: `pnpm --filter @aratti/mobile test`
- Web admin tests: `pnpm --filter @aratti/web-admin test`

## Deployment

- Backend and web-admin deploy on Vercel projects
- Neon hosts PostgreSQL
- Prisma migrations via CI/CD before promoting release
- Webhook endpoints configured in Mercado Pago dashboard
- Observability through Sentry and audit logs in `audit_logs`

Detailed architecture is documented in `docs/01-system-architecture.md` and `docs/02-monorepo-structure.md`.
