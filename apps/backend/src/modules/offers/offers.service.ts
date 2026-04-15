import { haversineDistanceKm } from "../../lib/geo";
import { HttpError } from "../../lib/errors";
import type { NearbyOffersQuery } from "./offers.repository";
import { OffersRepository } from "./offers.repository";

export class OffersService {
  constructor(private readonly offersRepository: OffersRepository) {}

  async getNearbyOffers(input: NearbyOffersQuery) {
    const offers = await this.offersRepository.findNearbyActiveOffers(input);

    const withDistance = offers
      .map((offer) => {
        const distanceKm = haversineDistanceKm(
          { lat: input.lat, lng: input.lng },
          { lat: Number(offer.business.latitude), lng: Number(offer.business.longitude) },
        );

        return {
          id: offer.id,
          businessId: offer.businessId,
          businessName: offer.business.name,
          title: offer.title,
          description: offer.description,
          rescuePriceArs: offer.rescuePriceArs,
          originalPriceArs: offer.originalPriceArs,
          quantityAvailable: offer.quantityAvailable,
          pickupStartAt: offer.pickupStartAt.toISOString(),
          pickupEndAt: offer.pickupEndAt.toISOString(),
          imageUrl: offer.images[0]?.imageUrl,
          status: offer.status,
          isFeatured: offer.isFeatured,
          distanceKm,
        };
      })
      .filter((offer) => offer.distanceKm <= input.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, input.limit);

    return {
      data: withDistance,
      nextCursor: null,
    };
  }

  async getOfferById(id: string) {
    const offer = await this.offersRepository.findOfferById(id);

    if (!offer || offer.deletedAt) {
      throw new HttpError(404, "offer_not_found", "Offer not found");
    }

    return {
      id: offer.id,
      business: {
        id: offer.business.id,
        name: offer.business.name,
        ratingAverage: Number(offer.business.ratingAverage),
        address: offer.business.addressLine1,
        city: offer.business.city,
        province: offer.business.province,
      },
      title: offer.title,
      description: offer.description,
      quantityAvailable: offer.quantityAvailable,
      rescuePriceArs: offer.rescuePriceArs,
      originalPriceArs: offer.originalPriceArs,
      pickupStartAt: offer.pickupStartAt.toISOString(),
      pickupEndAt: offer.pickupEndAt.toISOString(),
      images: offer.images.map((image) => image.imageUrl),
      status: offer.status,
    };
  }
}
