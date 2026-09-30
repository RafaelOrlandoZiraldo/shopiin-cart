import type { Category } from "../domain/catalog/category";
import type { Product } from "../domain/catalog/product";
import type { Order } from "../domain/orders/order";

export type AdminOrderSummary = Order & {
  itemCount: number;
};

export interface AdminRepository {
  listCategories(): Promise<Category[]>;
  createCategory(input: Omit<Category, "id" | "createdAt">): Promise<Category>;
  updateCategory(id: string, input: Omit<Category, "id" | "createdAt">): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;
  listProducts(): Promise<Product[]>;
  createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  updateProduct(id: string, input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null>;
  setProductActive(id: string, active: boolean): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  listOrders(): Promise<AdminOrderSummary[]>;
}
