import { useQuery } from "@tanstack/react-query";

import { mobileApi } from "../lib/api-client";

export function useOrderHistory(status: "active" | "past" | "cancelled" = "active") {
  return useQuery({
    queryKey: ["orders", "history", status],
    queryFn: () => mobileApi.getOrderHistory({ status, limit: 20 }),
  });
}
