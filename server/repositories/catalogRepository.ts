import type { Category } from "../domain/catalog/category";
import type { Product } from "../domain/catalog/product";

export type ProductSearchCriteria = {
  categorySlug?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type ProductSearchResult = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
};

export interface CatalogRepository {
  listActiveCategories(): Promise<Category[]>;
  searchActiveProducts(criteria: ProductSearchCriteria): Promise<ProductSearchResult>;
  findActiveProductById(productId: string): Promise<Product | null>;
}
