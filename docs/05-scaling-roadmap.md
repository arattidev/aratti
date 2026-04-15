# Scaling Roadmap

## Phase 1 (Launch Argentina)

- Mercado Pago + Apple Pay
- CABA + GBA geographies
- Core rescue flow with QR pickup
- Business offer publishing and admin oversight

## Phase 2 (Growth LATAM)

- Multi-country currency support
- Country-specific compliance and tax adaptations
- Multi-language copy packs
- Stripe activation for new markets

## Phase 3 (Optimization)

- Personalized recommendations per user behavior
- Dynamic rescue price suggestions for merchants
- Predictive no-show scoring
- Advanced fraud graph analysis

## Phase 4 (Platformization)

- Partner APIs for enterprise chains
- Marketplace ads and featured placements
- Loyalty and subscription retention loops
- Data warehouse and BI event pipeline

## Engineering scaling path

1. Keep monolith backend in Next.js until sustained load requires split.
2. Introduce background workers (queue) for non-critical tasks.
3. Read-replica strategy in Neon for analytics-heavy queries.
4. Add CDN image transformations and map tile caching.
5. Add contract tests and canary rollout pipeline.
