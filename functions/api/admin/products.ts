import { upsertProductSchema } from "../../../server/application/admin/dtos";
import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { D1AdminRepository } from "../../../server/infrastructure/d1/d1AdminRepository";
import { getD1Database } from "../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../server/shared/http/responses";
import { parseDto } from "../../../server/shared/http/validation";
import { withAdminAuth } from "../_shared/adminAuth";
import { readJsonBody } from "../_shared/httpInputs";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withRateLimit } from "../_shared/rateLimit";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ env }) => {
  const products = await new D1AdminRepository(getD1Database(env)).listProducts();
  return jsonResponse(products, { status: 200 });
})));

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ request, env }) => {
  const body = parseDto(upsertProductSchema, await readJsonBody(request));
  const product = await new D1AdminRepository(getD1Database(env)).createProduct({
    ...body,
    description: body.description ?? null,
    imageUrl: body.imageUrl ?? null,
  });
  return jsonResponse(product, { status: 201 });
})));
