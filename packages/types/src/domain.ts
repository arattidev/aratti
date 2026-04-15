export type UUID = string;

export type UserRole = "USER" | "BUSINESS_OWNER" | "BUSINESS_STAFF" | "ADMIN";

export type OfferStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "ARCHIVED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "PICKED_UP"
  | "NO_SHOW"
  | "REFUNDED"
  | "PAYMENT_EXPIRED";

export type PaymentProvider = "MERCADO_PAGO" | "APPLE_PAY" | "STRIPE";

export type CurrencyCode = "ARS";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BusinessSummary {
  id: UUID;
  name: string;
  category: string;
  addressLine1: string;
  city: string;
  province: string;
  coordinates: Coordinates;
  ratingAverage: number;
  verificationStatus: string;
}

export interface OfferCard {
  id: UUID;
  businessId: UUID;
  businessName: string;
  title: string;
  description?: string;
  rescuePriceArs: number;
  originalPriceArs: number;
  quantityAvailable: number;
  pickupStartAt: string;
  pickupEndAt: string;
  distanceKm?: number;
  imageUrl?: string;
  status: OfferStatus;
  isFeatured: boolean;
}

export interface OrderSummary {
  id: UUID;
  orderNumber: string;
  offerId: UUID;
  offerTitle: string;
  businessName: string;
  quantity: number;
  totalArs: number;
  status: OrderStatus;
  pickupWindow: {
    startAt: string;
    endAt: string;
  };
  createdAt: string;
}

export interface PaymentSummary {
  id: UUID;
  orderId: UUID;
  provider: PaymentProvider;
  amountArs: number;
  currencyCode: CurrencyCode;
  status: string;
}
