import { createCheckout } from "../../server/application/checkout/createCheckout";
import { checkoutHeadersSchema, checkoutRequestSchema } from "../../server/application/checkout/dtos";
import type { CloudflareEnv } from "../../server/infrastructure/cloudflare/bindings";
import { D1CartRepository } from "../../server/infrastructure/d1/d1CartRepository";
import { D1CatalogRepository } from "../../server/infrastructure/d1/d1CatalogRepository";
import { getD1Database } from "../../server/infrastructure/d1/database";
import { D1OrderRepository } from "../../server/infrastructure/d1/d1OrderRepository";
import { D1PaymentRepository } from "../../server/infrastructure/d1/d1PaymentRepository";
import { FakePaymentProvider } from "../../server/infrastructure/payments/fakePaymentProvider";
import { jsonResponse } from "../../server/shared/http/responses";
import { parseDto } from "../../server/shared/http/validation";
import { readJsonBody } from "./_shared/httpInputs";
import type { PagesFunction } from "./_shared/pagesFunction";
import { withRateLimit } from "./_shared/rateLimit";
import { withErrorHandling } from "./_shared/withErrorHandling";

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "checkout", limit: 10, windowSeconds: 60 },
  async ({ request, env }) => {
    const headers = parseDto(checkoutHeadersSchema, {
      cartSessionId: request.headers.get("X-Cart-Session"),
      idempotencyKey: request.headers.get("Idempotency-Key"),
    });
    const checkout = parseDto(checkoutRequestSchema, await readJsonBody(request));
    const db = getD1Database(env);
    const response = await createCheckout(
      new D1CartRepository(db),
      new D1CatalogRepository(db),
      new D1OrderRepository(db),
      new D1PaymentRepository(db),
      new FakePaymentProvider(),
      {
        cartSessionId: headers.cartSessionId,
        idempotencyKey: headers.idempotencyKey,
        checkout,
      },
    );

    return jsonResponse(response, { status: 200 });
  },
));
