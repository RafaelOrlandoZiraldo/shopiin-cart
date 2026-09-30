import type { Category } from "../../domain/catalog/category";
import type { Product } from "../../domain/catalog/product";
import type { ProductSearchResult } from "../../repositories/catalogRepository";

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
};

export type ProductDto = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
};

export type ProductListDto = {
  items: ProductDto[];
  page: number;
  pageSize: number;
  total: number;
};

export function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

export function toProductDto(product: Product): ProductDto {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
  };
}

export function toProductListDto(result: ProductSearchResult): ProductListDto {
  return {
    items: result.items.map(toProductDto),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };
}
