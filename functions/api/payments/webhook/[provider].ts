import {
  paymentProviderParamsSchema,
  paymentWebhookSchema,
} from "../../../../server/application/payments/dtos";
import { handlePaymentWebhook } from "../../../../server/application/payments/handlePaymentWebhook";
import type { CloudflareEnv } from "../../../../server/infrastructure/cloudflare/bindings";
import { getD1Database } from "../../../../server/infrastructure/d1/database";
import { D1OrderRepository } from "../../../../server/infrastructure/d1/d1OrderRepository";
import { D1PaymentRepository } from "../../../../server/infrastructure/d1/d1PaymentRepository";
import { jsonResponse } from "../../../../server/shared/http/responses";
import { parseDto } from "../../../../server/shared/http/validation";
import { parseParams, readJsonBody } from "../../_shared/httpInputs";
import type { PagesFunction } from "../../_shared/pagesFunction";
import { withRateLimit } from "../../_shared/rateLimit";
import { withErrorHandling } from "../../_shared/withErrorHandling";

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "payment_webhook", limit: 120, windowSeconds: 60 },
  async ({ request, env, params }) => {
    const { provider } = parseParams(paymentProviderParamsSchema, params);
    const webhook = parseDto(paymentWebhookSchema, await readJsonBody(request));
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
