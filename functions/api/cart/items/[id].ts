import { cartItemIdParamsSchema, updateCartItemBodySchema } from "../../../../server/application/cart/dtos";
import { removeCartItem } from "../../../../server/application/cart/removeCartItem";
import { updateCartItem } from "../../../../server/application/cart/updateCartItem";
import type { CloudflareEnv } from "../../../../server/infrastructure/cloudflare/bindings";
import { D1CartRepository } from "../../../../server/infrastructure/d1/d1CartRepository";
import { getD1Database } from "../../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../../server/shared/http/responses";
import { parseDto } from "../../../../server/shared/http/validation";
import { parseParams, readCartSessionId, readJsonBody } from "../../_shared/httpInputs";
import type { PagesFunction } from "../../_shared/pagesFunction";
import { withRateLimit } from "../../_shared/rateLimit";
import { withErrorHandling } from "../../_shared/withErrorHandling";

export const onRequestPut: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "cart_mutation", limit: 60, windowSeconds: 60 },
  async ({ request, env, params }) => {
    const sessionId = readCartSessionId(request);
    const { id } = parseParams(cartItemIdParamsSchema, params);
    const body = parseDto(updateCartItemBodySchema, await readJsonBody(request));
    const repository = new D1CartRepository(getD1Database(env));
    const cart = await updateCartItem(repository, sessionId, id, body);

    return jsonResponse(cart, { status: 200 });
  },
));

export const onRequestDelete: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "cart_mutation", limit: 60, windowSeconds: 60 },
  async ({ request, env, params }) => {
    const sessionId = readCartSessionId(request);
    const { id } = parseParams(cartItemIdParamsSchema, params);
    const repository = new D1CartRepository(getD1Database(env));
    const cart = await removeCartItem(repository, sessionId, id);

    return jsonResponse(cart, { status: 200 });
  },
));
