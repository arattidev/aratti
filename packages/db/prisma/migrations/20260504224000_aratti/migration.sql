-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'BUSINESS', 'BUSINESS_OWNER', 'BUSINESS_STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('PASSWORD', 'GOOGLE', 'MAGIC_LINK', 'CLERK');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING_DELETION');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('BAKERY', 'CAFE', 'RESTAURANT', 'PASTRY', 'PREMIUM_GREENGROCER', 'HOTEL', 'OTHER');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "OfferCategory" AS ENUM ('BAKERY', 'CAFE', 'RESTAURANT', 'PASTRY', 'PREMIUM_GREENGROCER', 'HOTEL', 'VEGAN', 'GLUTEN_FREE', 'OTHER');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'PICKED_UP', 'NO_SHOW', 'REFUNDED', 'PAYMENT_EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MERCADO_PAGO', 'APPLE_PAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'REQUIRES_ACTION', 'AUTHORIZED', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayoutProvider" AS ENUM ('MOCK', 'STRIPE');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_CONFIRMED', 'PICKUP_REMINDER', 'FAVORITE_NEW_OFFER', 'BUSINESS_NEW_ORDER', 'PAYOUT_SENT', 'ADMIN_ALERT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "clerk_user_id" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'PASSWORD',
    "email_verified_at" TIMESTAMPTZ(6),
    "phone" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'es-AR',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_seen_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cuit" TEXT,
    "description" TEXT,
    "category" "BusinessCategory" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT,
    "country_code" TEXT NOT NULL DEFAULT 'AR',
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    "opening_hours" JSONB NOT NULL,
    "verification_status" "BusinessStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "payout_account_ref" TEXT,
    "logo_url" TEXT,
    "hero_image_url" TEXT,
    "rating_average" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_members" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "member_role" "BusinessMemberRole" NOT NULL DEFAULT 'STAFF',
    "invited_by_user_id" UUID,
    "accepted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "business_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "OfferCategory" NOT NULL,
    "original_price_ars" INTEGER NOT NULL,
    "rescue_price_ars" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'ARS',
    "quantity_total" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,
    "min_per_order" INTEGER NOT NULL DEFAULT 1,
    "max_per_order" INTEGER,
    "pickup_start_at" TIMESTAMPTZ(6) NOT NULL,
    "pickup_end_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "published_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_images" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "blur_hash" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "offer_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_availability" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "quantity_published" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'PUBLISHED',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "business_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'ARS',
    "unit_price_ars" INTEGER NOT NULL,
    "subtotal_ars" INTEGER NOT NULL,
    "service_fee_ars" INTEGER NOT NULL DEFAULT 0,
    "total_ars" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "pickup_code" TEXT,
    "pickup_qr_token_hash" TEXT,
    "reserved_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "picked_up_at" TIMESTAMPTZ(6),
    "no_show_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "provider_payment_id" TEXT,
    "provider_preference_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "amount_ars" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'ARS',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "installments" INTEGER,
    "metadata" JSONB,
    "last_webhook_at" TIMESTAMPTZ(6),
    "authorized_at" TIMESTAMPTZ(6),
    "captured_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "refunded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'PUSH',
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "scheduled_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "platform" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_activity_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_link_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "amount_ars" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'ARS',
    "provider" "PayoutProvider" NOT NULL DEFAULT 'MOCK',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "scheduled_for" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "requested_by_user_id" UUID,
    "reason" TEXT NOT NULL,
    "amount_ars" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "provider_refund_id" TEXT,
    "provider_response" JSONB,
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_role" "UserRole",
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "risk_score" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "idx_businesses_owner_user_id" ON "businesses"("owner_user_id");

-- CreateIndex
CREATE INDEX "idx_businesses_verification_status" ON "businesses"("verification_status");

-- CreateIndex
CREATE INDEX "idx_businesses_category" ON "businesses"("category");

-- CreateIndex
CREATE INDEX "idx_businesses_lat_lng" ON "businesses"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "idx_businesses_created_at" ON "businesses"("created_at");

-- CreateIndex
CREATE INDEX "idx_business_members_user_id" ON "business_members"("user_id");

-- CreateIndex
CREATE INDEX "idx_business_members_business_id" ON "business_members"("business_id");

-- CreateIndex
CREATE INDEX "idx_business_members_created_at" ON "business_members"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_business_members_business_user" ON "business_members"("business_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_offers_business_status" ON "offers"("business_id", "status");

-- CreateIndex
CREATE INDEX "idx_offers_status_pickup_window" ON "offers"("status", "pickup_start_at", "pickup_end_at");

-- CreateIndex
CREATE INDEX "idx_offers_category" ON "offers"("category");

-- CreateIndex
CREATE INDEX "idx_offers_rescue_price_ars" ON "offers"("rescue_price_ars");

-- CreateIndex
CREATE INDEX "idx_offers_created_at" ON "offers"("created_at");

-- CreateIndex
CREATE INDEX "idx_offer_images_offer_id" ON "offer_images"("offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_offer_images_offer_sort" ON "offer_images"("offer_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_business_availability_business_date" ON "business_availability"("business_id", "date");

-- CreateIndex
CREATE INDEX "idx_business_availability_status_date" ON "business_availability"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_business_availability_scope_day" ON "business_availability"("business_id", "offer_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_orders_user_created_at" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_orders_business_created_at" ON "orders"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_orders_offer_created_at" ON "orders"("offer_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_orders_status_created_at" ON "orders"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_payments_order_id" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_payments_user_created_at" ON "payments"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_payments_status_created_at" ON "payments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payments_provider_external" ON "payments"("provider", "provider_payment_id");

-- CreateIndex
CREATE INDEX "idx_favorites_user_created_at" ON "favorites"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_favorites_business_id" ON "favorites"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_favorites_user_business" ON "favorites"("user_id", "business_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "idx_reviews_business_created_at" ON "reviews"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reviews_offer_created_at" ON "reviews"("offer_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_reviews_user_created_at" ON "reviews"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_notifications_user_status_created_at" ON "notifications"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "idx_notifications_type_created_at" ON "notifications"("type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "idx_sessions_user_status" ON "sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_sessions_expires_at" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_sessions_created_at" ON "sessions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_sessions_user_device" ON "sessions"("user_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_tokens_token_hash_key" ON "magic_link_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_magic_link_tokens_user_exp" ON "magic_link_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "idx_magic_link_tokens_email" ON "magic_link_tokens"("email");

-- CreateIndex
CREATE INDEX "idx_payouts_business_created_at" ON "payouts"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_payouts_status_created_at" ON "payouts"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_refunds_payment_created_at" ON "refunds"("payment_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_refunds_order_created_at" ON "refunds"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_refunds_status_created_at" ON "refunds"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_refunds_requested_by_user_id" ON "refunds"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity_created_at" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_created_at" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_action_created_at" ON "audit_logs"("action", "created_at");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_images" ADD CONSTRAINT "offer_images_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_availability" ADD CONSTRAINT "business_availability_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_availability" ADD CONSTRAINT "business_availability_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_link_tokens" ADD CONSTRAINT "magic_link_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
