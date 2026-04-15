import { createOrderBodySchema, createOrderResponseSchema } from "../schemas/orders";
import { nearbyOffersQuerySchema, nearbyOffersResponseSchema } from "../schemas/offers";
import { loginBodySchema, loginResponseSchema } from "../schemas/auth";
import { createPaymentBodySchema, createPaymentResponseSchema } from "../schemas/payments";
import { businessOrdersQuerySchema, createBusinessOfferBodySchema } from "../schemas/business";
import { HttpClient } from "./http";

export class MobileApiClient {
  constructor(private readonly httpClient: HttpClient) {}

  async login(input: unknown) {
    const payload = loginBodySchema.parse(input);
    const data = await this.httpClient.request("/api/auth/login", {
      method: "POST",
      body: payload,
    });
    return loginResponseSchema.parse(data);
  }

  async getNearbyOffers(input: unknown) {
    const query = nearbyOffersQuerySchema.parse(input);
    const queryParams = new URLSearchParams(
      Object.entries(query)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();

    const data = await this.httpClient.request(`/api/offers/nearby?${queryParams}`);
    return nearbyOffersResponseSchema.parse(data);
  }

  async getOfferById(id: string) {
    return this.httpClient.request(`/api/offers/${id}`);
  }

  async getOrderHistory(input: { status?: "active" | "past" | "cancelled"; limit?: number }) {
    const params = new URLSearchParams(
      Object.entries({
        status: input.status,
        limit: input.limit ? String(input.limit) : undefined,
      }).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    ).toString();

    return this.httpClient.request<{ data: unknown[]; nextCursor: string | null }>(`/api/orders/history?${params}`);
  }

  async createOrder(input: unknown) {
    const payload = createOrderBodySchema.parse(input);
    const data = await this.httpClient.request("/api/orders", {
      method: "POST",
      body: payload,
    });
    return createOrderResponseSchema.parse(data);
  }

  async createPayment(input: unknown) {
    const payload = createPaymentBodySchema.parse(input);
    const data = await this.httpClient.request("/api/payments/create", {
      method: "POST",
      body: payload,
    });
    return createPaymentResponseSchema.parse(data);
  }

  async createBusinessOffer(input: unknown) {
    const payload = createBusinessOfferBodySchema.parse(input);
    return this.httpClient.request("/api/business/offers", {
      method: "POST",
      body: payload,
    });
  }

  async getBusinessOrders(input: { status?: string; limit?: number } = {}) {
    const query = businessOrdersQuerySchema.parse({
      status: input.status,
      limit: input.limit ?? 20,
    });

    const queryParams = new URLSearchParams(
      Object.entries(query)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();

    return this.httpClient.request<{ data: Array<{ orderNumber: string; status: string; totalArs: number }> }>(
      `/api/business/orders?${queryParams}`,
    );
  }
}
