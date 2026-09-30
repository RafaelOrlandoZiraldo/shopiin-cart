import { upsertCategorySchema } from "../../../server/application/admin/dtos";
import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { D1AdminRepository } from "../../../server/infrastructure/d1/d1AdminRepository";
import { getD1Database } from "../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../server/shared/http/responses";
import { parseDto } from "../../../server/shared/http/validation";
import { readJsonBody } from "../_shared/httpInputs";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withAdminAuth } from "../_shared/adminAuth";
import { withRateLimit } from "../_shared/rateLimit";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ env }) => {
  const categories = await new D1AdminRepository(getD1Database(env)).listCategories();
  return jsonResponse(categories, { status: 200 });
})));

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ request, env }) => {
  const body = parseDto(upsertCategorySchema, await readJsonBody(request));
  const category = await new D1AdminRepository(getD1Database(env)).createCategory(body);
  return jsonResponse(category, { status: 201 });
})));
