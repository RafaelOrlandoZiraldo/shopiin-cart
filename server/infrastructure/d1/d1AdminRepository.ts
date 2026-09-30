import type { D1Database } from "@cloudflare/workers-types";
import type { Category } from "../../domain/catalog/category";
import type { Product } from "../../domain/catalog/product";
import type { Order, OrderStatus } from "../../domain/orders/order";
import type { PaymentStatus } from "../../domain/payments/payment";
import type { AdminOrderSummary, AdminRepository } from "../../repositories/adminRepository";

type CategoryRow = { Id: string; Name: string; Slug: string; Active: number; CreatedAt: string };
type ProductRow = {
  Id: string; CategoryId: string; Name: string; Description: string | null; PriceCents: number;
  ImageUrl: string | null; Active: number; CreatedAt: string; UpdatedAt: string;
};
type OrderRow = {
  Id: string; CartId: string | null; Email: string; FirstName: string; LastName: string;
  Phone: string | null; Status: OrderStatus; PaymentStatus: PaymentStatus; SubtotalCents: number;
  ShippingCents: number; TotalCents: number; ShippingAddressJson: string; IdempotencyKey: string | null;
  CreatedAt: string; UpdatedAt: string; ItemCount: number;
};
type ChangesRow = { Changes: number };

export class D1AdminRepository implements AdminRepository {
  constructor(private readonly db: D1Database) {}

  async listCategories(): Promise<Category[]> {
    const result = await this.db.prepare(
      "SELECT Id, Name, Slug, Active, CreatedAt FROM Categories ORDER BY Name ASC",
    ).all<CategoryRow>();
    return result.results.map(mapCategory);
  }

  async createCategory(input: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const category = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await this.db.prepare(
      "INSERT INTO Categories (Id, Name, Slug, Active, CreatedAt) VALUES (?, ?, ?, ?, ?)",
    ).bind(category.id, category.name, category.slug, category.active ? 1 : 0, category.createdAt).run();
    return category;
  }

  async updateCategory(id: string, input: Omit<Category, "id" | "createdAt">): Promise<Category | null> {
    await this.db.prepare(
      "UPDATE Categories SET Name = ?, Slug = ?, Active = ? WHERE Id = ?",
    ).bind(input.name, input.slug, input.active ? 1 : 0, id).run();
    return this.findCategory(id);
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.db.prepare("DELETE FROM Categories WHERE Id = ?").bind(id).run();
    return (await this.db.prepare("SELECT changes() AS Changes").first<ChangesRow>())?.Changes === 1;
  }

  async listProducts(): Promise<Product[]> {
    const result = await this.db.prepare(
      `SELECT Id, CategoryId, Name, Description, PriceCents, ImageUrl, Active, CreatedAt, UpdatedAt
       FROM Products ORDER BY CreatedAt DESC`,
    ).all<ProductRow>();
    return result.results.map(mapProduct);
  }

  async createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const now = new Date().toISOString();
    const product = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await this.db.prepare(
      `INSERT INTO Products (Id, CategoryId, Name, Description, PriceCents, ImageUrl, Active, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(product.id, product.categoryId, product.name, product.description, product.priceCents, product.imageUrl, product.active ? 1 : 0, now, now).run();
    return product;
  }

  async updateProduct(id: string, input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null> {
    await this.db.prepare(
      `UPDATE Products SET CategoryId = ?, Name = ?, Description = ?, PriceCents = ?, ImageUrl = ?, Active = ?, UpdatedAt = ?
       WHERE Id = ?`,
    ).bind(input.categoryId, input.name, input.description, input.priceCents, input.imageUrl, input.active ? 1 : 0, new Date().toISOString(), id).run();
    return this.findProduct(id);
  }

  async setProductActive(id: string, active: boolean): Promise<Product | null> {
    await this.db.prepare("UPDATE Products SET Active = ?, UpdatedAt = ? WHERE Id = ?")
      .bind(active ? 1 : 0, new Date().toISOString(), id).run();
    return this.findProduct(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.db.prepare("DELETE FROM Products WHERE Id = ?").bind(id).run();
    return (await this.db.prepare("SELECT changes() AS Changes").first<ChangesRow>())?.Changes === 1;
  }

  async listOrders(): Promise<AdminOrderSummary[]> {
    const result = await this.db.prepare(
      `SELECT o.Id, o.CartId, o.Email, o.FirstName, o.LastName, o.Phone, o.Status, o.PaymentStatus,
              o.SubtotalCents, o.ShippingCents, o.TotalCents, o.ShippingAddressJson, o.IdempotencyKey,
              o.CreatedAt, o.UpdatedAt, COUNT(oi.Id) AS ItemCount
       FROM Orders o
       LEFT JOIN OrderItems oi ON oi.OrderId = o.Id
       GROUP BY o.Id
       ORDER BY o.CreatedAt DESC`,
    ).all<OrderRow>();
    return result.results.map((row) => ({ ...mapOrder(row), itemCount: row.ItemCount }));
  }

  private async findCategory(id: string): Promise<Category | null> {
    const row = await this.db.prepare("SELECT Id, Name, Slug, Active, CreatedAt FROM Categories WHERE Id = ?")
      .bind(id).first<CategoryRow>();
    return row ? mapCategory(row) : null;
  }

  private async findProduct(id: string): Promise<Product | null> {
    const row = await this.db.prepare(
      `SELECT Id, CategoryId, Name, Description, PriceCents, ImageUrl, Active, CreatedAt, UpdatedAt
       FROM Products WHERE Id = ?`,
    ).bind(id).first<ProductRow>();
    return row ? mapProduct(row) : null;
  }
}

function mapCategory(row: CategoryRow): Category {
  return { id: row.Id, name: row.Name, slug: row.Slug, active: row.Active === 1, createdAt: row.CreatedAt };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.Id, categoryId: row.CategoryId, name: row.Name, description: row.Description,
    priceCents: row.PriceCents, imageUrl: row.ImageUrl, active: row.Active === 1,
    createdAt: row.CreatedAt, updatedAt: row.UpdatedAt,
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.Id, cartId: row.CartId, email: row.Email, firstName: row.FirstName, lastName: row.LastName,
    phone: row.Phone, status: row.Status, paymentStatus: row.PaymentStatus, subtotalCents: row.SubtotalCents,
    shippingCents: row.ShippingCents, totalCents: row.TotalCents, shippingAddressJson: row.ShippingAddressJson,
    idempotencyKey: row.IdempotencyKey, createdAt: row.CreatedAt, updatedAt: row.UpdatedAt,
  };
}
