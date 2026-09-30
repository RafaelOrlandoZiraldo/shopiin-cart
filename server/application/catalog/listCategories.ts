import type { CatalogRepository } from "../../repositories/catalogRepository";
import { toCategoryDto, type CategoryDto } from "./catalogDtos";

export async function listCategories(repository: CatalogRepository): Promise<CategoryDto[]> {
  const categories = await repository.listActiveCategories();

  return categories.map(toCategoryDto);
}
