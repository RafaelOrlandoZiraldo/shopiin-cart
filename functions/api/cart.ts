import { clearCart } from "../../server/application/cart/clearCart";
import { getCart } from "../../server/application/cart/getCart";
import type { CloudflareEnv } from "../../server/infrastructure/cloudflare/bindings";
import { D1CartRepository } from "../../server/infrastructure/d1/d1CartRepository";
import { getD1Database } from "../../server/infrastructure/d1/database";
import { jsonResponse } from "../../server/shared/http/responses";
import { readCartSessionId } from "./_shared/httpInputs";
import type { PagesFunction } from "./_shared/pagesFunction";
import { withRateLimit } from "./_shared/rateLimit";
import { withErrorHandling } from "./_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async ({ request, env }) => {
  const sessionId = readCartSessionId(request);
  const repository = new D1CartRepository(getD1Database(env));
  const cart = await getCart(repository, sessionId);

  return jsonResponse(cart, { status: 200 });
});

export const onRequestDelete: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "cart_mutation", limit: 60, windowSeconds: 60 },
  async ({ request, env }) => {
    const sessionId = readCartSessionId(request);
    const repository = new D1CartRepository(getD1Database(env));
    const cart = await clearCart(repository, sessionId);

    return jsonResponse(cart, { status: 200 });
  },
));
