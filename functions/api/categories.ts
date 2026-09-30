import { listCategories } from "../../server/application/catalog/listCategories";
import type { CloudflareEnv } from "../../server/infrastructure/cloudflare/bindings";
import { getD1Database } from "../../server/infrastructure/d1/database";
import { D1CatalogRepository } from "../../server/infrastructure/d1/d1CatalogRepository";
import { jsonResponse } from "../../server/shared/http/responses";
import type { PagesFunction } from "./_shared/pagesFunction";
import { withErrorHandling } from "./_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async ({ env }) => {
  const repository = new D1CatalogRepository(getD1Database(env));
  const categories = await listCategories(repository);

  return jsonResponse(categories, { status: 200 });
});
