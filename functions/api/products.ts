import { listProducts } from "../../server/application/catalog/listProducts";
import { listProductsQuerySchema } from "../../server/application/catalog/dtos";
import type { CloudflareEnv } from "../../server/infrastructure/cloudflare/bindings";
import { getD1Database } from "../../server/infrastructure/d1/database";
import { D1CatalogRepository } from "../../server/infrastructure/d1/d1CatalogRepository";
import { jsonResponse } from "../../server/shared/http/responses";
import { parseDto } from "../../server/shared/http/validation";
import type { PagesFunction } from "./_shared/pagesFunction";
import { withErrorHandling } from "./_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async ({ request, env }) => {
  const url = new URL(request.url);
  const query = parseDto(listProductsQuerySchema, Object.fromEntries(url.searchParams));
  const repository = new D1CatalogRepository(getD1Database(env));
  const products = await listProducts(repository, query);

  return jsonResponse(products, { status: 200 });
});
