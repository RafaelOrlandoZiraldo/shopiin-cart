import { getProductById } from "../../../server/application/catalog/getProductById";
import { productIdParamsSchema } from "../../../server/application/catalog/dtos";
import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { getD1Database } from "../../../server/infrastructure/d1/database";
import { D1CatalogRepository } from "../../../server/infrastructure/d1/d1CatalogRepository";
import { jsonResponse } from "../../../server/shared/http/responses";
import { parseDto } from "../../../server/shared/http/validation";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async ({ env, params }) => {
  const { id } = parseDto(productIdParamsSchema, { id: params.id });
  const repository = new D1CatalogRepository(getD1Database(env));
  const product = await getProductById(repository, id);

  return jsonResponse(product, { status: 200 });
});
