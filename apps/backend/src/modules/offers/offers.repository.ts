import { prisma, type Prisma } from "@aratti/db";

export interface NearbyOffersQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  category: string | undefined;
  maxPriceArs: number | undefined;
  pickupStart: string | undefined;
  pickupEnd: string | undefined;
  limit: number;
}

export class OffersRepository {
  async findNearbyActiveOffers(input: NearbyOffersQuery) {
    const latDelta = input.radiusKm / 111;
    const lngDelta = input.radiusKm / (111 * Math.max(Math.cos((input.lat * Math.PI) / 180), 0.2));

    const where: Prisma.OfferWhereInput = {
      deletedAt: null,
      status: "ACTIVE",
      quantityAvailable: { gt: 0 },
      ...(input.maxPriceArs !== undefined ? { rescuePriceArs: { lte: input.maxPriceArs } } : {}),
      ...(input.category ? { category: input.category as never } : {}),
      ...(input.pickupStart ? { pickupStartAt: { gte: new Date(input.pickupStart) } } : {}),
      pickupEndAt: input.pickupEnd ? { lte: new Date(input.pickupEnd) } : { gte: new Date() },
      business: {
        deletedAt: null,
        verificationStatus: "ACTIVE",
        latitude: {
          gte: input.lat - latDelta,
          lte: input.lat + latDelta,
        },
        longitude: {
          gte: input.lng - lngDelta,
          lte: input.lng + lngDelta,
        },
      },
    };

    return prisma.offer.findMany({
      where,
      include: {
        business: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      take: Math.min(input.limit * 4, 200),
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  }

  async findOfferById(id: string) {
    return prisma.offer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        business: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }
}
