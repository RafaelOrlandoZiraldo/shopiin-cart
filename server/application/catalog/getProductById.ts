import { AppError } from "../../shared/http/appError";
import type { CatalogRepository } from "../../repositories/catalogRepository";
import { toProductDto, type ProductDto } from "./catalogDtos";

export async function getProductById(
  repository: CatalogRepository,
  productId: string,
): Promise<ProductDto> {
  const product = await repository.findActiveProductById(productId);

  if (!product) {
    throw new AppError({
      type: "not_found",
      title: "Product not found",
      status: 404,
      detail: "The requested product was not found",
    });
  }

  return toProductDto(product);
}
