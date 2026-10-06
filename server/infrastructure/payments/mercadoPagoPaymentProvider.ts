import type {
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentProvider,
} from "../../application/payments/paymentProvider";
import { AppError } from "../../shared/http/appError";

type MercadoPagoPaymentProviderConfig = {
  accessToken: string;
  notificationUrl?: string;
  backUrlBase?: string;
  statementDescriptor?: string;
};

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export class MercadoPagoPaymentProvider implements PaymentProvider {
  constructor(private readonly config: MercadoPagoPaymentProviderConfig) {}

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult> {
    const preference = await this.createPreference(request);

    return {
      provider: "mercadopago",
      providerPaymentId: preference.id,
      status: "Pending",
      redirectUrl: preference.init_point ?? preference.sandbox_init_point ?? null,
    };
  }

  private async createPreference(request: CreatePaymentRequest): Promise<MercadoPagoPreferenceResponse> {
    const amount = request.amountCents / 100;
    const body = {
      external_reference: request.orderId,
      auto_return: this.config.backUrlBase ? "approved" : undefined,
      notification_url: this.config.notificationUrl,
      statement_descriptor: this.config.statementDescriptor,
      metadata: {
        order_id: request.orderId,
        idempotency_key: request.idempotencyKey,
      },
      back_urls: this.config.backUrlBase
        ? {
            success: `${this.config.backUrlBase}/checkout?payment=success`,
            pending: `${this.config.backUrlBase}/checkout?payment=pending`,
            failure: `${this.config.backUrlBase}/checkout?payment=failure`,
          }
        : undefined,
      items: [
        {
          id: request.orderId,
          title: `Orden ${request.orderId}`,
          quantity: 1,
          currency_id: request.currency,
          unit_price: amount,
        },
      ],
      payer: {
        email: request.customerEmail,
      },
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.accessToken}`,
        "content-type": "application/json",
        "x-idempotency-key": request.idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("mercadopago_preference_failed", {
        status: response.status,
        orderId: request.orderId,
      });
      throw new AppError({
        type: "payment_provider_error",
        title: "Payment provider failed",
        status: 502,
        detail: "Could not create payment preference",
      });
    }

    return response.json() as Promise<MercadoPagoPreferenceResponse>;
  }
}
