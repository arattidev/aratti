# System Architecture (Argentina-first MVP)

## 1) Architecture goals

- Mobile-first UX with fast offer discovery and checkout
- Secure and auditable order/payment lifecycle
- Launch in weeks with low operational overhead
- Keep code modular so business/admin capabilities can grow without rewrites

## 2) Core architecture decisions

- Monorepo with PNPM + Turbo for shared domain code and faster iteration
- Next.js backend on Vercel for API routes, webhooks, cron jobs, and optional server-rendered admin views
- Prisma + Neon PostgreSQL for fast schema iteration and type-safe data access
- Clerk for auth (Apple, Google, email OTP) with session token verification in backend
- Payment abstraction layer to support Mercado Pago now and Stripe later
- Expo Router app for user and business flows in one binary (role-based navigation)

## 3) Bounded contexts

### Marketplace (user)

- Browse nearby offers, map/list, reserve, pay, pickup QR
- Tables: users, offers, offer_images, orders, favorites, reviews, notifications

### Merchant operations (business)

- Onboarding, offer CRUD, order handling, pickup verification, payout profile
- Tables: businesses, business_members, offers, orders, notifications

### Payments and risk

- Payment intent orchestration, webhook processing, refunds, fraud heuristics
- Tables: payments, refunds, audit_logs

### Platform admin

- Business verification queue, refund tooling, suspicious activity review
- Tables: businesses, audit_logs, refunds, sessions

## 4) Runtime topology

- apps/mobile -> Expo app distributed via App Store and Play Store
- apps/backend -> Next.js app on Vercel:
  - REST endpoints under /api/*
  - Payment webhooks under /api/webhooks/*
  - Scheduled jobs (cleanup, reminders, fraud checks)
- apps/web-admin -> Next.js app for business/admin dashboard (mobile responsive)
- Neon Postgres -> primary data store
- Sentry -> errors/performance tracing
- PostHog (optional) -> analytics events

## 5) Request lifecycle (reserve + pay)

1. Mobile requests nearby offers from /api/offers/nearby with lat/lng and filters.
2. User reserves pack via /api/orders (creates order in pending_payment).
3. Backend creates payment session via payment provider adapter.
4. Provider webhook confirms payment; backend transitions order to confirmed.
5. App receives order confirmation + QR payload.
6. Business scans QR on pickup and confirms via /api/orders/:id/pickup.
7. Audit log captures every critical transition.

## 6) API style and layering

- REST API for operational simplicity and ecosystem compatibility.
- Layering inside backend app:
  - route handlers (transport)
  - controllers (request orchestration)
  - services (business rules)
  - repositories (Prisma data access)
  - schemas (Zod validation)
- Never expose Prisma models directly to clients; always use DTOs.

## 7) AuthN and AuthZ model

- AuthN: Clerk-issued tokens from mobile and web clients
- AuthZ: role and ownership checks in service layer:
  - user
  - business_owner
  - business_staff
  - admin
- Session revocation support with first-party sessions table for device-level controls

## 8) Security baseline

- Zod validation at every API boundary
- Rate limiting by IP + user + endpoint criticality
- Signed webhook verification for Mercado Pago/Stripe
- Secure headers and strict CORS policy
- Secrets only in server environment variables
- Refresh-token rotation and device revocation
- Fraud checks for repeated refunds/suspicious order bursts

## 9) Performance strategy

- Nearby feed query optimized by geo indexes and active-offer indexes
- Cursor pagination for list endpoints
- CDN image delivery and responsive image sizes
- Mobile query caching + optimistic mutations (TanStack Query)
- Background jobs for non-blocking side effects (notifications, analytics writes)

## 10) Localization and regional defaults

- Default currency: ARS
- Default timezone: America/Argentina/Buenos_Aires
- UX copy optimized for Argentina (Rescata comida, Cerca tuyo, Retira hoy)
- Payment priority: Mercado Pago + Apple Pay

## 11) Launch-first scope (weeks, not months)

Include in v1:

- User reservations and checkout
- Business offer publishing and order management
- Pickup QR verification
- Core refunds and auditability

Defer from v1:

- Advanced recommendation engine
- Multi-country tax engines
- Complex subscription plans
