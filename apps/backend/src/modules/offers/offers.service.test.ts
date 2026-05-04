import { describe, expect, it } from "vitest";

import { OffersService } from "./offers.service";

describe("OffersService", () => {
  it("sorts nearby offers by computed distance", async () => {
    const repository = {
      findNearbyActiveOffers: async () => [
        {
          id: "1",
          businessId: "b1",
          title: "Pack A",
          description: "desc",
          rescuePriceArs: 1000,
          originalPriceArs: 2000,
          quantityAvailable: 5,
          pickupStartAt: new Date(),
          pickupEndAt: new Date(Date.now() + 3_600_000),
          status: "ACTIVE",
          isFeatured: false,
          createdAt: new Date(),
          business: { id: "b1", name: "Near", latitude: -34.6037, longitude: -58.3816 },
          images: [],
        },
        {
          id: "2",
          businessId: "b2",
          title: "Pack B",
          description: "desc",
          rescuePriceArs: 1000,
          originalPriceArs: 2000,
          quantityAvailable: 5,
          pickupStartAt: new Date(),
          pickupEndAt: new Date(Date.now() + 3_600_000),
          status: "ACTIVE",
          isFeatured: false,
          createdAt: new Date(),
          business: { id: "b2", name: "Far", latitude: -34.6537, longitude: -58.4816 },
          images: [],
        },
      ],
      findOfferById: async () => null,
    } as never;

    const service = new OffersService(repository);

    const result = await service.getNearbyOffers({
      lat: -34.6037,
      lng: -58.3816,
      radiusKm: 20,
      category: undefined,
      maxPriceArs: undefined,
      pickupStart: undefined,
      pickupEnd: undefined,
      limit: 10,
    });

    expect(result.data[0]?.businessName).toBe("Near");
  });
});
