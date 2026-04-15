# Security Checklist

## Request and API safety

- [x] Validate payloads and query with Zod
- [x] Role and ownership authorization in service layer
- [x] Never trust client-provided totals or status transitions
- [x] Rate limit all public and sensitive endpoints

## Auth and sessions

- [x] Clerk-based identity
- [x] First-party `sessions` table for device revocation support
- [x] Secure token storage on mobile with SecureStore
- [x] Sensitive values kept server-side only

## Payments and webhooks

- [x] Provider abstraction enforces explicit payment lifecycle
- [x] Webhook signature verification
- [x] Idempotency keys for payment creation
- [x] Payment events stored in `payments` and `audit_logs`

## Data safety

- [x] Prisma type-safe queries (SQL injection-safe defaults)
- [x] Soft delete fields on key entities
- [x] Audit logs for high-risk actions

## Fraud controls

- [x] Refund frequency risk checks
- [x] Purchase burst detection
- [x] Admin fraud flags endpoint

## Platform hardening

- [x] Security headers in middleware
- [x] Strict API no-store cache policy
- [ ] Add bot detection / WAF at edge
- [ ] Add anomaly alerts and auto-lock rules
