import { describe, expect, it } from "vitest";
import { getProductById } from "../server/application/catalog/getProductById";
import { listProducts } from "../server/application/catalog/listProducts";
import { listProductsQuerySchema, productIdParamsSchema } from "../server/application/catalog/dtos";
import type { Product } from "../server/domain/catalog/product";
import type { CatalogRepository } from "../server/repositories/catalogRepository";
import { AppError } from "../server/shared/http/appError";
import { parseDto } from "../server/shared/http/validation";

const product: Product = {
  id: "33333333-3333-4333-8333-333333333331",
  categoryId: "11111111-1111-4111-8111-111111111111",
  name: "Agua mineral 500ml",
  description: "Agua mineral sin gas en botella individual.",
  priceCents: 900,
  imageUrl: null,
  active: true,
  createdAt: "2026-09-29T00:00:00.000Z",
  updatedAt: "2026-09-29T00:00:00.000Z",
};

describe("catalog query DTOs", () => {
  it("normalizes product filters and pagination", () => {
    const dto = parseDto(listProductsQuerySchema, {
      category: " bebidas ",
      search: " agua ",
      page: "2",
      pageSize: "12",
    });

    expect(dto).toEqual({
      category: "bebidas",
      search: "agua",
      page: 2,
      pageSize: 12,
    });
  });

  it("defaults pagination values", () => {
    const dto = parseDto(listProductsQuerySchema, {});

    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(20);
  });

  it("rejects invalid product ids", () => {
    expect(() => parseDto(productIdParamsSchema, { id: "not-a-uuid" })).toThrow(AppError);
  });
});

describe("catalog application services", () => {
  it("passes product search criteria to the repository", async () => {
    const repository: CatalogRepository = {
      listActiveCategories: async () => [],
      findActiveProductById: async () => null,
      searchActiveProducts: async (criteria) => ({
        items: [product],
        page: criteria.page,
        pageSize: criteria.pageSize,
        total: 1,
      }),
    };

    const result = await listProducts(repository, {
      category: "bebidas",
      search: "agua",
      page: 2,
      pageSize: 5,
    });

    expect(result).toEqual({
      items: [
        {
          id: product.id,
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
        },
      ],
      page: 2,
      pageSize: 5,
      total: 1,
    });
  });

  it("throws a 404 when product does not exist", async () => {
    const repository: CatalogRepository = {
      listActiveCategories: async () => [],
      searchActiveProducts: async () => ({ items: [], page: 1, pageSize: 20, total: 0 }),
      findActiveProductById: async () => null,
    };

    await expect(getProductById(repository, product.id)).rejects.toMatchObject({
      problem: {
        status: 404,
        type: "not_found",
      },
    });
  });
});
