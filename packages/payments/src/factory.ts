import type { PaymentProvider, PaymentProviderName } from "./types";
import { ApplePayProvider } from "./providers/apple-pay";
import { MercadoPagoProvider, type MercadoPagoConfig } from "./providers/mercado-pago";
import { StripeProvider } from "./providers/stripe";

export interface PaymentProviderFactoryConfig {
  mercadoPago: MercadoPagoConfig;
}

export function createPaymentProvider(
  provider: PaymentProviderName,
  config: PaymentProviderFactoryConfig,
): PaymentProvider {
  if (provider === "MERCADO_PAGO") {
    return new MercadoPagoProvider(config.mercadoPago);
  }

  if (provider === "APPLE_PAY") {
    return new ApplePayProvider();
  }

  return new StripeProvider();
}
