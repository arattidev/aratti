import { PrismaClient } from "@prisma/client";

declare global {
  // Reuse the Prisma client in development to avoid exhausting database connections.
  // eslint-disable-next-line no-var
  var __arattiPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__arattiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__arattiPrisma = prisma;
}
