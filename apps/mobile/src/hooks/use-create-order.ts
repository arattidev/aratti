import { useMutation } from "@tanstack/react-query";

import { mobileApi } from "../lib/api-client";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: {
      offerId: string;
      quantity: number;
      paymentProvider: "MERCADO_PAGO" | "APPLE_PAY" | "STRIPE";
      idempotencyKey: string;
    }) => mobileApi.createOrder(payload),
  });
}
