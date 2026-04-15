import { useQuery } from "@tanstack/react-query";

import { mobileApi } from "../lib/api-client";

export function useNearbyOffers(params: {
  lat: number;
  lng: number;
  category?: string;
  maxPriceArs?: number;
}) {
  return useQuery({
    queryKey: ["offers", "nearby", params],
    queryFn: () =>
      mobileApi.getNearbyOffers({
        lat: params.lat,
        lng: params.lng,
        radiusKm: 8,
        category: params.category,
        maxPriceArs: params.maxPriceArs,
        limit: 20,
      }),
  });
}
