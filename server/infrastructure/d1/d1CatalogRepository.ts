import type { D1Database } from "@cloudflare/workers-types";
import type { Category } from "../../domain/catalog/category";
import type { Product } from "../../domain/catalog/product";
import type {
  CatalogRepository,
  ProductSearchCriteria,
  ProductSearchResult,
} from "../../repositories/catalogRepository";

type CategoryRow = {
  Id: string;
  Name: string;
  Slug: string;
  Active: number;
  CreatedAt: string;
};

type ProductRow = {
  Id: string;
  CategoryId: string;
  Name: string;
  Description: string | null;
  PriceCents: number;
  ImageUrl: string | null;
  Active: number;
  CreatedAt: string;
  UpdatedAt: string;
};

type CountRow = {
  Total: number;
};

export class D1CatalogRepository implements CatalogRepository {
  constructor(private readonly db: D1Database) {}

  async listActiveCategories(): Promise<Category[]> {
    const result = await this.db
      .prepare(
        `SELECT Id, Name, Slug, Active, CreatedAt
         FROM Categories
         WHERE Active = 1
         ORDER BY Name ASC`,
      )
      .all<CategoryRow>();

    return result.results.map(mapCategoryRow);
  }

  async searchActiveProducts(criteria: ProductSearchCriteria): Promise<ProductSearchResult> {
    const { whereSql, params } = buildProductFilters(criteria);
    const limit = criteria.pageSize;
    const offset = (criteria.page - 1) * criteria.pageSize;

    const totalResult = await this.db
      .prepare(
        `SELECT COUNT(*) AS Total
         FROM Products p
         INNER JOIN Categories c ON c.Id = p.CategoryId
         ${whereSql}`,
      )
      .bind(...params)
      .first<CountRow>();

    const productsResult = await this.db
      .prepare(
        `SELECT p.Id, p.CategoryId, p.Name, p.Description, p.PriceCents, p.ImageUrl, p.Active, p.CreatedAt, p.UpdatedAt
         FROM Products p
         INNER JOIN Categories c ON c.Id = p.CategoryId
         ${whereSql}
         ORDER BY p.Name ASC
         LIMIT ? OFFSET ?`,
      )
      .bind(...params, limit, offset)
      .all<ProductRow>();

    return {
      items: productsResult.results.map(mapProductRow),
      page: criteria.page,
      pageSize: criteria.pageSize,
      total: totalResult?.Total ?? 0,
    };
  }

  async findActiveProductById(productId: string): Promise<Product | null> {
    const row = await this.db
      .prepare(
        `SELECT p.Id, p.CategoryId, p.Name, p.Description, p.PriceCents, p.ImageUrl, p.Active, p.CreatedAt, p.UpdatedAt
         FROM Products p
         INNER JOIN Categories c ON c.Id = p.CategoryId
         WHERE p.Id = ? AND p.Active = 1 AND c.Active = 1`,
      )
      .bind(productId)
      .first<ProductRow>();

    return row ? mapProductRow(row) : null;
  }
}

function buildProductFilters(criteria: ProductSearchCriteria): {
  whereSql: string;
  params: Array<string>;
} {
  const filters = ["p.Active = 1", "c.Active = 1"];
  const params: Array<string> = [];

  if (criteria.categorySlug) {
    filters.push("c.Slug = ?");
    params.push(criteria.categorySlug);
  }

  if (criteria.search) {
    filters.push("(p.Name LIKE ? OR p.Description LIKE ?)");
    const searchPattern = `%${criteria.search}%`;
    params.push(searchPattern, searchPattern);
  }

  return {
    whereSql: `WHERE ${filters.join(" AND ")}`,
    params,
  };
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.Id,
    name: row.Name,
    slug: row.Slug,
    active: row.Active === 1,
    createdAt: row.CreatedAt,
  };
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.Id,
    categoryId: row.CategoryId,
    name: row.Name,
    description: row.Description,
    priceCents: row.PriceCents,
    imageUrl: row.ImageUrl,
    active: row.Active === 1,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}
