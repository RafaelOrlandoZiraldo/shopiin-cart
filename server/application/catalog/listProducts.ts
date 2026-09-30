import type { CatalogRepository } from "../../repositories/catalogRepository";
import { toProductListDto, type ProductListDto } from "./catalogDtos";
import type { ListProductsQueryDto } from "./dtos";

export async function listProducts(
  repository: CatalogRepository,
  query: ListProductsQueryDto,
): Promise<ProductListDto> {
  const result = await repository.searchActiveProducts({
    categorySlug: query.category,
    search: query.search,
    page: query.page,
    pageSize: query.pageSize,
  });

  return toProductListDto(result);
}
