import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProduct, fetchProducts } from "../api/catalogApi";
import type { ProductFilters } from "../types/catalog";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
  });
}

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: ["catalog", "products", filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: ["catalog", "product", productId],
    queryFn: () => fetchProduct(productId),
  });
}
