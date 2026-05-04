import { prisma } from "@aratti/db";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async createBusinessUser(input: {
    email: string;
    passwordHash?: string;
    firstName?: string;
    locale?: string;
    authProvider?: "PASSWORD" | "GOOGLE" | "MAGIC_LINK" | "CLERK";
    businessName?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash ?? null,
          authProvider: input.authProvider ?? "PASSWORD",
          firstName: input.firstName ?? null,
          locale: input.locale ?? "es-AR",
          role: "BUSINESS",
          emailVerifiedAt: input.authProvider === "GOOGLE" || input.authProvider === "CLERK" ? new Date() : null,
        },
      });

      const business = await tx.business.create({
        data: {
          ownerUserId: user.id,
          name: input.businessName ?? `${input.firstName ?? "New"} Business`,
          slug: `${(input.businessName ?? input.firstName ?? "business").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${user.id.slice(0, 8)}`,
          category: "OTHER",
          addressLine1: "Pending setup",
          city: "Pending",
          province: "Pending",
          countryCode: "AR",
          latitude: "0",
          longitude: "0",
          openingHours: {},
          verificationStatus: "ACTIVE",
        },
      });

      await tx.businessMember.create({
        data: {
          businessId: business.id,
          userId: user.id,
          memberRole: "OWNER",
          acceptedAt: new Date(),
        },
      });

      return user;
    });
  }

  async upsertLegacyClerkUser(input: {
    clerkUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    locale: string;
  }) {
    return prisma.user.upsert({
      where: {
        email: input.email,
      },
      update: {
        clerkUserId: input.clerkUserId,
        authProvider: "CLERK",
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        avatarUrl: input.avatarUrl ?? null,
        locale: input.locale,
        lastSeenAt: new Date(),
        deletedAt: null,
      },
      create: {
        clerkUserId: input.clerkUserId,
        email: input.email,
        authProvider: "CLERK",
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        avatarUrl: input.avatarUrl ?? null,
        locale: input.locale,
      },
    });
  }

  async updateUserLastSeen(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  async upsertOAuthUser(input: { email: string; firstName?: string; authProvider: "GOOGLE" }) {
    return prisma.user.upsert({
      where: {
        email: input.email,
      },
      update: {
        firstName: input.firstName ?? null,
        authProvider: input.authProvider,
        emailVerifiedAt: new Date(),
        deletedAt: null,
        lastSeenAt: new Date(),
      },
      create: {
        email: input.email,
        firstName: input.firstName ?? null,
        authProvider: input.authProvider,
        role: "BUSINESS",
        emailVerifiedAt: new Date(),
        locale: "es-AR",
      },
    });
  }

  async createMagicLinkToken(input: { userId: string; email: string; tokenHash: string; expiresAt: Date }) {
    return prisma.magicLinkToken.create({
      data: {
        userId: input.userId,
        email: input.email,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  async consumeMagicLinkToken(input: { email: string; tokenHash: string }) {
    const token = await prisma.magicLinkToken.findFirst({
      where: {
        email: input.email,
        tokenHash: input.tokenHash,
        consumedAt: null,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!token) {
      return null;
    }

    if (token.expiresAt.getTime() < Date.now()) {
      return null;
    }

    await prisma.magicLinkToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });

    return token.user;
  }

  async findBusinessIdsForUser(userId: string) {
    const memberships = await prisma.businessMember.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        businessId: true,
      },
    });

    return memberships.map((entry) => entry.businessId);
  }

  async ensureBusinessMembershipForUser(input: { userId: string; businessName?: string }) {
    const currentMembership = await prisma.businessMember.findFirst({
      where: {
        userId: input.userId,
        deletedAt: null,
      },
    });

    if (currentMembership) {
      return currentMembership.businessId;
    }

    const business = await prisma.business.create({
      data: {
        ownerUserId: input.userId,
        name: input.businessName ?? "New Business",
        slug: `${(input.businessName ?? "business").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.userId.slice(0, 8)}`,
        category: "OTHER",
        addressLine1: "Pending setup",
        city: "Pending",
        province: "Pending",
        countryCode: "AR",
        latitude: "0",
        longitude: "0",
        openingHours: {},
        verificationStatus: "ACTIVE",
      },
    });

    await prisma.businessMember.create({
      data: {
        businessId: business.id,
        userId: input.userId,
        memberRole: "OWNER",
        acceptedAt: new Date(),
      },
    });

    return business.id;
  }
}
