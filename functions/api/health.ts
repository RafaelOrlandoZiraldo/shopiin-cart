import { getHealth } from "../../server/application/health/getHealth";
import type { CloudflareEnv } from "../../server/infrastructure/cloudflare/bindings";
import { jsonResponse } from "../../server/shared/http/responses";
import type { PagesFunction } from "./_shared/pagesFunction";
import { withErrorHandling } from "./_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async () => {
  return jsonResponse(getHealth(), { status: 200 });
});
