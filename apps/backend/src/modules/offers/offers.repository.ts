import { prisma } from "@aratti/db";

export interface NearbyOffersQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  category?: string;
  maxPriceArs?: number;
  pickupStart?: string;
  pickupEnd?: string;
  limit: number;
}

export class OffersRepository {
  async findNearbyActiveOffers(input: NearbyOffersQuery) {
    const latDelta = input.radiusKm / 111;
    const lngDelta = input.radiusKm / (111 * Math.max(Math.cos((input.lat * Math.PI) / 180), 0.2));

    return prisma.offer.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        quantityAvailable: { gt: 0 },
        rescuePriceArs: input.maxPriceArs ? { lte: input.maxPriceArs } : undefined,
        category: input.category ? (input.category as never) : undefined,
        pickupStartAt: input.pickupStart ? { gte: new Date(input.pickupStart) } : undefined,
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
      },
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
