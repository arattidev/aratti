import { nearbyOffersQuerySchema, offerDetailParamsSchema } from "@aratti/api";

import { apiSuccess } from "../../lib/http";
import { applyApiGuard, parseQuery } from "../../lib/security/request";
import { OffersRepository } from "./offers.repository";
import { OffersService } from "./offers.service";

const offersService = new OffersService(new OffersRepository());

export async function getNearbyOffersController(request: Request) {
  await applyApiGuard("offers.nearby");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, nearbyOffersQuerySchema);
  const data = await offersService.getNearbyOffers({
    lat: query.lat,
    lng: query.lng,
    radiusKm: query.radiusKm,
    category: query.category,
    maxPriceArs: query.maxPriceArs,
    pickupStart: query.pickupStart,
    pickupEnd: query.pickupEnd,
    limit: query.limit,
  });
  return apiSuccess(data);
}

export async function getOfferByIdController(params: { id: string }) {
  const parsed = offerDetailParamsSchema.parse(params);
  await applyApiGuard("offers.detail");
  const data = await offersService.getOfferById(parsed.id);
  return apiSuccess(data);
}
