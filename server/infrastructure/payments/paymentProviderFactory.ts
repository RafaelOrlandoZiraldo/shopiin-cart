import type { CloudflareEnv } from "../cloudflare/bindings";
import { FakePaymentProvider } from "./fakePaymentProvider";
import { MercadoPagoPaymentProvider } from "./mercadoPagoPaymentProvider";
import type { PaymentProvider } from "../../application/payments/paymentProvider";
import { AppError } from "../../shared/http/appError";

export function createPaymentProvider(env: CloudflareEnv): PaymentProvider {
  const provider = env.PAYMENT_PROVIDER ?? "fake";

  if (provider === "fake") {
    return new FakePaymentProvider();
  }

  if (provider === "mercadopago") {
    if (!env.MERCADOPAGO_ACCESS_TOKEN) {
      throw missingPaymentConfig("MERCADOPAGO_ACCESS_TOKEN is required");
    }

    return new MercadoPagoPaymentProvider({
      accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
      notificationUrl: env.MERCADOPAGO_NOTIFICATION_URL,
      backUrlBase: env.MERCADOPAGO_BACK_URL_BASE,
      statementDescriptor: env.MERCADOPAGO_STATEMENT_DESCRIPTOR,
    });
  }

  throw missingPaymentConfig("Unsupported payment provider");
}

function missingPaymentConfig(detail: string) {
  return new AppError({
    type: "payment_configuration_error",
    title: "Payment provider is not configured",
    status: 500,
    detail,
  });
}
