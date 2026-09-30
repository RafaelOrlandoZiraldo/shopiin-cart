import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { D1AdminRepository } from "../../../server/infrastructure/d1/d1AdminRepository";
import { getD1Database } from "../../../server/infrastructure/d1/database";
import { jsonResponse } from "../../../server/shared/http/responses";
import { withAdminAuth } from "../_shared/adminAuth";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withRateLimit } from "../_shared/rateLimit";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ env }) => {
  const orders = await new D1AdminRepository(getD1Database(env)).listOrders();
  return jsonResponse(orders, { status: 200 });
})));
