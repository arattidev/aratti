import { prisma, type Prisma } from "@aratti/db";

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
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.category !== undefined ? { category: input.category as never } : {}),
          ...(input.originalPriceArs !== undefined ? { originalPriceArs: input.originalPriceArs } : {}),
          ...(input.rescuePriceArs !== undefined ? { rescuePriceArs: input.rescuePriceArs } : {}),
          ...(input.quantityTotal !== undefined ? { quantityTotal: input.quantityTotal } : {}),
          ...(input.pickupStartAt !== undefined ? { pickupStartAt: input.pickupStartAt } : {}),
          ...(input.pickupEndAt !== undefined ? { pickupEndAt: input.pickupEndAt } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
        },
      });
    });
  }

  async listBusinessOrders(input: { businessId: string; status: string | undefined; limit: number }) {
    const where: Prisma.OrderWhereInput = {
      businessId: input.businessId,
      deletedAt: null,
      ...(input.status ? { status: input.status as never } : {}),
    };

    return prisma.order.findMany({
      where,
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

  async listBusinessOffers(input: { businessId: string; status: string | undefined; limit: number }) {
    const where: Prisma.OfferWhereInput = {
      businessId: input.businessId,
      deletedAt: null,
      ...(input.status ? { status: input.status as never } : {}),
    };

    return prisma.offer.findMany({
      where,
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
        notes: input.notes ?? null,
      },
      create: {
        businessId: input.businessId,
        offerId: input.offerId,
        date: input.date,
        quantityPublished: input.quantityPublished,
        quantityAvailable: input.quantityAvailable,
        status: input.status,
        notes: input.notes ?? null,
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

  async listBusinessAvailability(input: { businessId: string; from: Date | undefined; to: Date | undefined; limit: number }) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (input.from) dateFilter.gte = input.from;
    if (input.to) dateFilter.lte = input.to;

    return prisma.businessAvailability.findMany({
      where: {
        businessId: input.businessId,
        ...(input.from || input.to ? { date: dateFilter } : {}),
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
        ...(input.quantityPublished !== undefined ? { quantityPublished: input.quantityPublished } : {}),
        ...(input.quantityAvailable !== undefined ? { quantityAvailable: input.quantityAvailable } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
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
    const data: Prisma.PayoutUncheckedCreateInput = {
      businessId: input.businessId,
      amountArs: input.amountArs,
      provider: input.provider,
      status: input.status,
      reference: input.reference ?? null,
      paidAt: input.paidAt ?? null,
    };

    if (input.metadata !== undefined) {
      data.metadata = input.metadata as Prisma.InputJsonValue;
    }

    return prisma.payout.create({
      data,
    });
  }

  async listPayouts(input: { businessId: string; status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | undefined; limit: number }) {
    const where: Prisma.PayoutWhereInput = {
      businessId: input.businessId,
      ...(input.status ? { status: input.status } : {}),
    };

    return prisma.payout.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }
}
