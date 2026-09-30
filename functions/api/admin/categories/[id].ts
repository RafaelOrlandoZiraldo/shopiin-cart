import { idParamsSchema, upsertCategorySchema } from "../../../../server/application/admin/dtos";
import { notFoundError } from "../../../../server/application/admin/adminErrors";
import type { CloudflareEnv } from "../../../../server/infrastructure/cloudflare/bindings";
import { D1AdminRepository } from "../../../../server/infrastructure/d1/d1AdminRepository";
import { getD1Database } from "../../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../../server/shared/http/responses";
import { parseDto } from "../../../../server/shared/http/validation";
import { withAdminAuth } from "../../_shared/adminAuth";
import { parseParams, readJsonBody } from "../../_shared/httpInputs";
import type { PagesFunction } from "../../_shared/pagesFunction";
import { withRateLimit } from "../../_shared/rateLimit";
import { withErrorHandling } from "../../_shared/withErrorHandling";

export const onRequestPut: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ request, env, params }) => {
  const { id } = parseParams(idParamsSchema, params);
  const body = parseDto(upsertCategorySchema, await readJsonBody(request));
  const category = await new D1AdminRepository(getD1Database(env)).updateCategory(id, body);
  if (!category) throw notFoundError("Category");
  return jsonResponse(category, { status: 200 });
})));

export const onRequestDelete: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ env, params }) => {
  const { id } = parseParams(idParamsSchema, params);
  const deleted = await new D1AdminRepository(getD1Database(env)).deleteCategory(id);
  if (!deleted) throw notFoundError("Category");
  return jsonResponse({ deleted: true }, { status: 200 });
})));
