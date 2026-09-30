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

export type ProductFilters = {
  category?: string;
  search?: string;
  page: number;
  pageSize: number;
};
