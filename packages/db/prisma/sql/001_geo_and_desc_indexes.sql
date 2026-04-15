-- This script is optional but recommended for production on Neon.
-- It adds geo and DESC indexes that are easier to maintain in raw SQL.

-- Enable PostGIS for scalable distance queries.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Geo index on business coordinates for nearby search.
CREATE INDEX IF NOT EXISTS idx_businesses_geo_point
ON businesses
USING GIST (
  ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)
);

-- Active offers index optimized for discovery feed.
CREATE INDEX IF NOT EXISTS idx_offers_active_window_partial
ON offers (pickup_start_at, pickup_end_at)
WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- Descending indexes for timeline-style queries.
CREATE INDEX IF NOT EXISTS idx_orders_user_created_desc
ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_business_created_desc
ON orders (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offers_created_desc
ON offers (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_created_desc
ON payments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_desc
ON notifications (user_id, created_at DESC);
