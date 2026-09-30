import type {
  CategoryDto,
  ProductDto,
  ProductFilters,
  ProductListDto,
} from "../types/catalog";

async function requestJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function buildProductsUrl(filters: ProductFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  return `/api/products?${params.toString()}`;
}

export function fetchCategories(): Promise<CategoryDto[]> {
  return requestJson<CategoryDto[]>("/api/categories");
}

export function fetchProducts(filters: ProductFilters): Promise<ProductListDto> {
  return requestJson<ProductListDto>(buildProductsUrl(filters));
}

export function fetchProduct(productId: string): Promise<ProductDto> {
  return requestJson<ProductDto>(`/api/products/${productId}`);
}
