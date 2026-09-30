import { idParamsSchema, productStatusSchema } from "../../../../../server/application/admin/dtos";
import { notFoundError } from "../../../../../server/application/admin/adminErrors";
import type { CloudflareEnv } from "../../../../../server/infrastructure/cloudflare/bindings";
import { D1AdminRepository } from "../../../../../server/infrastructure/d1/d1AdminRepository";
import { getD1Database } from "../../../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../../../server/shared/http/responses";
import { parseDto } from "../../../../../server/shared/http/validation";
import { withAdminAuth } from "../../../_shared/adminAuth";
import { parseParams, readJsonBody } from "../../../_shared/httpInputs";
import type { PagesFunction } from "../../../_shared/pagesFunction";
import { withRateLimit } from "../../../_shared/rateLimit";
import { withErrorHandling } from "../../../_shared/withErrorHandling";

export const onRequestPatch: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ request, env, params }) => {
  const { id } = parseParams(idParamsSchema, params);
  const { active } = parseDto(productStatusSchema, await readJsonBody(request));
  const product = await new D1AdminRepository(getD1Database(env)).setProductActive(id, active);
  if (!product) throw notFoundError("Product");
  return jsonResponse(product, { status: 200 });
})));
