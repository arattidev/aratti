import { prisma } from "@aratti/db";

export class AuthRepository {
  async upsertUser(input: {
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
        firstName: input.firstName,
        lastName: input.lastName,
        avatarUrl: input.avatarUrl,
        locale: input.locale,
        lastSeenAt: new Date(),
        deletedAt: null,
      },
      create: {
        clerkUserId: input.clerkUserId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        avatarUrl: input.avatarUrl,
        locale: input.locale,
      },
    });
  }
}
