import {
  paymentProviderParamsSchema,
  paymentWebhookSchema,
} from "../../../../server/application/payments/dtos";
import { handlePaymentWebhook } from "../../../../server/application/payments/handlePaymentWebhook";
import type { CloudflareEnv } from "../../../../server/infrastructure/cloudflare/bindings";
import { getD1Database } from "../../../../server/infrastructure/d1/database";
import { D1OrderRepository } from "../../../../server/infrastructure/d1/d1OrderRepository";
import { D1PaymentRepository } from "../../../../server/infrastructure/d1/d1PaymentRepository";
import {
  isMercadoPagoWebhookConnectivityTest,
  parseMercadoPagoWebhook,
} from "../../../../server/infrastructure/payments/mercadoPagoWebhook";
import { AppError } from "../../../../server/shared/http/appError";
import { jsonResponse } from "../../../../server/shared/http/responses";
import { parseDto } from "../../../../server/shared/http/validation";
import { parseParams } from "../../_shared/httpInputs";
import type { PagesFunction } from "../../_shared/pagesFunction";
import { withRateLimit } from "../../_shared/rateLimit";
import { withErrorHandling } from "../../_shared/withErrorHandling";

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "payment_webhook", limit: 120, windowSeconds: 60 },
  async ({ request, env, params }) => {
    const { provider } = parseParams(paymentProviderParamsSchema, params);
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    if (provider === "mercadopago" && isMercadoPagoWebhookConnectivityTest(body)) {
      console.info("payment_webhook_connectivity_test", { provider });
      return jsonResponse({ received: true, test: true }, { status: 200 });
    }

    const webhook = provider === "mercadopago"
      ? await parseMercadoPagoWebhook({
          request,
          body,
          accessToken: requiredMercadoPagoAccessToken(env.MERCADOPAGO_ACCESS_TOKEN),
          webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET ?? env.PAYMENT_WEBHOOK_SECRET,
        })
      : parseDto(paymentWebhookSchema, body);
    const db = getD1Database(env);
    const result = await handlePaymentWebhook(
      new D1PaymentRepository(db),
      new D1OrderRepository(db),
      {
        provider,
        webhook,
      },
    );

    console.info("payment_webhook_processed", {
      provider,
      orderId: webhook.orderId,
      status: webhook.status,
      processed: result.processed,
    });

    return jsonResponse(result, { status: 200 });
  },
));

function requiredMercadoPagoAccessToken(accessToken: string | undefined): string {
  if (accessToken) {
    return accessToken;
  }

  throw new AppError({
    type: "payment_configuration_error",
    title: "Payment provider is not configured",
    status: 500,
    detail: "MERCADOPAGO_ACCESS_TOKEN is required",
  });
}
