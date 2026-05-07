-- AlterTable: extend payments with split-payment fields
ALTER TABLE "payments"
    ADD COLUMN "marketplace_fee_ars" INTEGER,
    ADD COLUMN "seller_amount_ars" INTEGER,
    ADD COLUMN "merchant_order_id" TEXT;

-- CreateIndex: lookup payments by Mercado Pago merchant_order_id
CREATE INDEX "idx_payments_merchant_order_id" ON "payments"("merchant_order_id");

-- CreateTable: per-business Mercado Pago OAuth credentials (split payments)
CREATE TABLE "mercado_pago_accounts" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "mp_user_id" TEXT NOT NULL,
    "access_token_cipher" TEXT NOT NULL,
    "refresh_token_cipher" TEXT NOT NULL,
    "public_key" TEXT,
    "live_mode" BOOLEAN NOT NULL DEFAULT true,
    "scope" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "connected_by_user_id" UUID,
    "connected_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "mercado_pago_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mercado_pago_accounts_business_id_key" ON "mercado_pago_accounts"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "mercado_pago_accounts_mp_user_id_key" ON "mercado_pago_accounts"("mp_user_id");

-- CreateIndex
CREATE INDEX "idx_mercado_pago_accounts_mp_user_id" ON "mercado_pago_accounts"("mp_user_id");

-- CreateIndex
CREATE INDEX "idx_mercado_pago_accounts_expires_at" ON "mercado_pago_accounts"("expires_at");

-- AddForeignKey
ALTER TABLE "mercado_pago_accounts"
    ADD CONSTRAINT "mercado_pago_accounts_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercado_pago_accounts"
    ADD CONSTRAINT "mercado_pago_accounts_connected_by_user_id_fkey"
    FOREIGN KEY ("connected_by_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
