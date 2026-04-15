# Monorepo Structure

## Root tree

```text
aratti/
  apps/
    mobile/                 # Expo Router app (user + business mobile experiences)
    backend/                # Next.js API app on Vercel (REST, webhooks, jobs)
    web-admin/              # Next.js web console (business + admin tooling)
  packages/
    api/                    # API contracts, client SDK, Zod DTOs
    auth/                   # Auth helpers, guards, session verification
    db/                     # Prisma schema, migrations, DB client, repositories
    payments/               # PaymentProvider interface + MercadoPago/ApplePay/Stripe adapter
    notifications/          # Push/email templates and dispatch services
    analytics/              # Event schema + PostHog/Sentry wrappers
    ui/                     # Shared design tokens and cross-platform primitives
    types/                  # Domain enums and shared TypeScript types
    config/                 # Shared eslint, prettier, tsconfig presets
  docs/
    01-system-architecture.md
    02-monorepo-structure.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

## App boundaries

### apps/mobile

- Expo Router route groups:
  - /(auth): splash, onboarding, login
  - /(tabs): home, search, orders, favorites, profile
  - /(checkout): checkout, success, qr
  - /(business): onboarding, dashboard, offers, orders
- State:
  - Zustand for session/local UI state
  - TanStack Query for server state
  - MMKV for non-sensitive persistence
  - SecureStore for tokens/secrets

### apps/backend

- Next.js route handlers as backend API:
  - /api/auth/*
  - /api/offers/*
  - /api/orders/*
  - /api/payments/*
  - /api/business/*
  - /api/admin/*
  - /api/webhooks/mercadopago
  - /api/webhooks/stripe
- Internal modules:
  - src/modules/* (feature slices)
  - src/lib/security/* (rate limit, authz, headers)
  - src/lib/observability/* (Sentry tracing, request logs)

### apps/web-admin

- Mobile-first responsive business/admin dashboard
- Uses same API contracts from packages/api
- Role-gated routes for business and platform admins

## Package boundaries

### packages/db

- Prisma schema and migrations
- Typed Prisma client singleton
- Repository helpers (read/write patterns)
- SQL utilities for geo and reporting queries

### packages/payments

- PaymentProvider interface:
  - createPaymentIntent
  - confirmPayment
  - refundPayment
  - webhookHandler
- Implementations:
  - MercadoPagoProvider (v1)
  - ApplePayProvider (v1 bridge)
  - StripeProvider (future-ready)

### packages/api

- Zod request/response contracts shared by mobile, admin, backend
- Typed HTTP client wrapper with retries and error normalization

## Naming and conventions

- Feature-first folders (offers, orders, payments, businesses)
- DB snake_case, app camelCase mapping through Prisma @map
- UUIDs for all primary and foreign keys
- Soft delete fields where record restoration/audit is useful

## Why this structure for fast MVP

- Single deployment target for backend (Vercel) minimizes ops
- Shared contracts reduce frontend-backend mismatch bugs
- Split apps allow user mobile velocity while keeping admin web practical
- Packages enforce clean boundaries but remain simple for junior onboarding
