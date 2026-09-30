import { describe, expect, it } from "vitest";
import { buildProductsUrl } from "../src/features/catalog/api/catalogApi";

describe("catalog API client", () => {
  it("builds product list URLs with filters and pagination", () => {
    expect(
      buildProductsUrl({
        category: "bebidas",
        search: "agua mineral",
        page: 2,
        pageSize: 12,
      }),
    ).toBe("/api/products?page=2&pageSize=12&category=bebidas&search=agua+mineral");
  });
});
