import { prisma } from "@aratti/db";

export class BusinessRepository {
  async findBusinessById(businessId: string) {
    return prisma.business.findFirst({
      where: {
        id: businessId,
        deletedAt: null,
      },
    });
  }

  async createOffer(input: {
    businessId: string;
    title: string;
    description: string;
    category: string;
    originalPriceArs: number;
    rescuePriceArs: number;
    quantityTotal: number;
    pickupStartAt: Date;
    pickupEndAt: Date;
    imageUrls: string[];
    tags: string[];
  }) {
    return prisma.offer.create({
      data: {
        businessId: input.businessId,
        title: input.title,
        description: input.description,
        category: input.category as never,
        originalPriceArs: input.originalPriceArs,
        rescuePriceArs: input.rescuePriceArs,
        quantityTotal: input.quantityTotal,
        quantityAvailable: input.quantityTotal,
        pickupStartAt: input.pickupStartAt,
        pickupEndAt: input.pickupEndAt,
        status: "ACTIVE",
        publishedAt: new Date(),
        tags: input.tags,
        images: {
          create: input.imageUrls.map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  async findOfferById(offerId: string) {
    return prisma.offer.findFirst({
      where: {
        id: offerId,
        deletedAt: null,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async updateOffer(input: {
    offerId: string;
    title?: string;
    description?: string;
    category?: string;
    originalPriceArs?: number;
    rescuePriceArs?: number;
    quantityTotal?: number;
    pickupStartAt?: Date;
    pickupEndAt?: Date;
    status?: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "ARCHIVED";
    imageUrls?: string[];
    tags?: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      if (input.imageUrls) {
        await tx.offerImage.deleteMany({
          where: { offerId: input.offerId },
        });

        if (input.imageUrls.length > 0) {
          await tx.offerImage.createMany({
            data: input.imageUrls.map((imageUrl, index) => ({
              offerId: input.offerId,
              imageUrl,
              sortOrder: index,
            })),
          });
        }
      }

      return tx.offer.update({
        where: { id: input.offerId },
        data: {
          title: input.title,
          description: input.description,
          category: input.category as never,
          originalPriceArs: input.originalPriceArs,
          rescuePriceArs: input.rescuePriceArs,
          quantityTotal: input.quantityTotal,
          pickupStartAt: input.pickupStartAt,
          pickupEndAt: input.pickupEndAt,
          status: input.status,
          tags: input.tags,
        },
      });
    });
  }

  async listBusinessOrders(input: { businessId: string; status?: string; limit: number }) {
    return prisma.order.findMany({
      where: {
        businessId: input.businessId,
        deletedAt: null,
        status: input.status ? (input.status as never) : undefined,
      },
      include: {
        offer: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }

  async listBusinessOffers(input: { businessId: string; status?: string; limit: number }) {
    return prisma.offer.findMany({
      where: {
        businessId: input.businessId,
        deletedAt: null,
        status: input.status ? (input.status as never) : undefined,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }

  async upsertAvailability(input: {
    businessId: string;
    offerId: string;
    date: Date;
    quantityPublished: number;
    quantityAvailable: number;
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    notes?: string;
  }) {
    return prisma.businessAvailability.upsert({
      where: {
        businessId_offerId_date: {
          businessId: input.businessId,
          offerId: input.offerId,
          date: input.date,
        },
      },
      update: {
        quantityPublished: input.quantityPublished,
        quantityAvailable: input.quantityAvailable,
        status: input.status,
        notes: input.notes,
      },
      create: {
        businessId: input.businessId,
        offerId: input.offerId,
        date: input.date,
        quantityPublished: input.quantityPublished,
        quantityAvailable: input.quantityAvailable,
        status: input.status,
        notes: input.notes,
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async listBusinessAvailability(input: { businessId: string; from?: Date; to?: Date; limit: number }) {
    return prisma.businessAvailability.findMany({
      where: {
        businessId: input.businessId,
        date: {
          gte: input.from,
          lte: input.to,
        },
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      take: input.limit,
    });
  }

  async findAvailabilityById(id: string) {
    return prisma.businessAvailability.findUnique({
      where: { id },
    });
  }

  async updateAvailability(input: {
    id: string;
    quantityPublished?: number;
    quantityAvailable?: number;
    status?: "DRAFT" | "PUBLISHED" | "CLOSED";
    notes?: string;
  }) {
    return prisma.businessAvailability.update({
      where: { id: input.id },
      data: {
        quantityPublished: input.quantityPublished,
        quantityAvailable: input.quantityAvailable,
        status: input.status,
        notes: input.notes,
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async createPayout(input: { businessId: string; amountArs: number; provider: "MOCK" | "STRIPE"; status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED"; reference?: string; metadata?: Record<string, unknown>; paidAt?: Date }) {
    return prisma.payout.create({
      data: {
        businessId: input.businessId,
        amountArs: input.amountArs,
        provider: input.provider,
        status: input.status,
        reference: input.reference,
        metadata: input.metadata,
        paidAt: input.paidAt,
      },
    });
  }

  async listPayouts(input: { businessId: string; status?: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED"; limit: number }) {
    return prisma.payout.findMany({
      where: {
        businessId: input.businessId,
        status: input.status,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }
}
