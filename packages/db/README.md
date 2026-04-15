# @aratti/db

Database package for Neon PostgreSQL and Prisma.

## Includes

- Complete MVP schema for users, businesses, offers, orders, payments, and risk/audit modules
- Prisma client singleton for backend apps
- Production SQL extras for geospatial and descending indexes

## Commands

- `pnpm --filter @aratti/db db:migrate`
- `pnpm --filter @aratti/db db:generate`
- `pnpm --filter @aratti/db db:studio`

## Notes

- Money values are stored as integer ARS amounts (`*_ars`) to avoid floating-point errors.
- Soft delete is implemented on entities where restoration/audit history is useful.
- Apply `prisma/sql/001_geo_and_desc_indexes.sql` after migrations in production to optimize nearby queries.
