import { prisma, type Prisma } from "@aratti/db";

export interface UpsertMercadoPagoAccountInput {
  businessId: string;
  mpUserId: string;
  accessTokenCipher: string;
  refreshTokenCipher: string;
  publicKey: string | null;
  liveMode: boolean;
  scope: string;
  expiresAt: Date;
  connectedByUserId?: string | null;
}

export interface UpdateMercadoPagoTokensInput {
  accessTokenCipher: string;
  refreshTokenCipher: string;
  expiresAt: Date;
  scope?: string;
  liveMode?: boolean;
}

export class MercadoPagoRepository {
  async findByBusinessId(businessId: string) {
    return prisma.mercadoPagoAccount.findFirst({
      where: {
        businessId,
        deletedAt: null,
        revokedAt: null,
      },
    });
  }

  async findActiveByBusinessId(businessId: string) {
    return prisma.mercadoPagoAccount.findUnique({
      where: { businessId },
    });
  }

  async upsertByBusinessId(input: UpsertMercadoPagoAccountInput) {
    const updateData: Prisma.MercadoPagoAccountUncheckedUpdateInput = {
      mpUserId: input.mpUserId,
      accessTokenCipher: input.accessTokenCipher,
      refreshTokenCipher: input.refreshTokenCipher,
      publicKey: input.publicKey,
      liveMode: input.liveMode,
      scope: input.scope,
      expiresAt: input.expiresAt,
      connectedByUserId: input.connectedByUserId ?? null,
      revokedAt: null,
      deletedAt: null,
      connectedAt: new Date(),
    };

    const createData: Prisma.MercadoPagoAccountUncheckedCreateInput = {
      businessId: input.businessId,
      mpUserId: input.mpUserId,
      accessTokenCipher: input.accessTokenCipher,
      refreshTokenCipher: input.refreshTokenCipher,
      publicKey: input.publicKey,
      liveMode: input.liveMode,
      scope: input.scope,
      expiresAt: input.expiresAt,
      connectedByUserId: input.connectedByUserId ?? null,
      connectedAt: new Date(),
    };

    return prisma.mercadoPagoAccount.upsert({
      where: { businessId: input.businessId },
      update: updateData,
      create: createData,
    });
  }

  async updateTokens(businessId: string, input: UpdateMercadoPagoTokensInput) {
    const data: Prisma.MercadoPagoAccountUpdateInput = {
      accessTokenCipher: input.accessTokenCipher,
      refreshTokenCipher: input.refreshTokenCipher,
      expiresAt: input.expiresAt,
      ...(input.scope !== undefined ? { scope: input.scope } : {}),
      ...(input.liveMode !== undefined ? { liveMode: input.liveMode } : {}),
    };

    return prisma.mercadoPagoAccount.update({
      where: { businessId },
      data,
    });
  }

  async softRevoke(businessId: string) {
    return prisma.mercadoPagoAccount.update({
      where: { businessId },
      data: {
        revokedAt: new Date(),
        deletedAt: new Date(),
      },
    });
  }
}
