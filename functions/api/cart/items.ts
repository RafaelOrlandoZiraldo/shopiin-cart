import { addCartItem } from "../../../server/application/cart/addCartItem";
import { addCartItemBodySchema } from "../../../server/application/cart/dtos";
import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { D1CartRepository } from "../../../server/infrastructure/d1/d1CartRepository";
import { D1CatalogRepository } from "../../../server/infrastructure/d1/d1CatalogRepository";
import { getD1Database } from "../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../server/shared/http/responses";
import { parseDto } from "../../../server/shared/http/validation";
import { readCartSessionId, readJsonBody } from "../_shared/httpInputs";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withRateLimit } from "../_shared/rateLimit";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit(
  { namespace: "cart_mutation", limit: 60, windowSeconds: 60 },
  async ({ request, env }) => {
    const sessionId = readCartSessionId(request);
    const body = parseDto(addCartItemBodySchema, await readJsonBody(request));
    const db = getD1Database(env);
    const cartRepository = new D1CartRepository(db);
    const catalogRepository = new D1CatalogRepository(db);
    const cart = await addCartItem(cartRepository, catalogRepository, sessionId, body);

    return jsonResponse(cart, { status: 200 });
  },
));
