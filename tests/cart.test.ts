import { describe, expect, it } from "vitest";
import { addCartItem } from "../server/application/cart/addCartItem";
import { updateCartItem } from "../server/application/cart/updateCartItem";
import { addCartItemBodySchema, updateCartItemBodySchema } from "../server/application/cart/dtos";
import type { Cart } from "../server/domain/cart/cart";
import type { CartItem } from "../server/domain/cart/cartItem";
import type { Product } from "../server/domain/catalog/product";
import type { CartRepository, CartWithItems } from "../server/repositories/cartRepository";
import type { CatalogRepository } from "../server/repositories/catalogRepository";
import { AppError } from "../server/shared/http/appError";
import { parseDto } from "../server/shared/http/validation";

const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
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

describe("cart DTO validation", () => {
  it("rejects non-positive quantities", () => {
    expect(() =>
      parseDto(addCartItemBodySchema, {
        productId: product.id,
        quantity: 0,
      }),
    ).toThrow(AppError);
  });

  it("ignores client-sent prices", () => {
    const dto = parseDto(addCartItemBodySchema, {
      productId: product.id,
      quantity: 2,
      priceCents: 1,
    });

    expect(dto).toEqual({
      productId: product.id,
      quantity: 2,
    });
  });
});

describe("cart application services", () => {
  it("adds an active product using the D1/catalog price and recalculates subtotal", async () => {
    const cartRepository = new InMemoryCartRepository();
    const catalogRepository = new StaticCatalogRepository(product);

    const cart = await addCartItem(cartRepository, catalogRepository, sessionId, {
      productId: product.id,
      quantity: 2,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: product.id,
      quantity: 2,
      unitPriceCents: 900,
      lineTotalCents: 1800,
    });
    expect(cart.subtotalCents).toBe(1800);
  });

  it("updates item quantity and recalculates subtotal", async () => {
    const cartRepository = new InMemoryCartRepository();
    const catalogRepository = new StaticCatalogRepository(product);
    const cart = await addCartItem(cartRepository, catalogRepository, sessionId, {
      productId: product.id,
      quantity: 1,
    });

    const updated = await updateCartItem(
      cartRepository,
      sessionId,
      cart.items[0].id,
      parseDto(updateCartItemBodySchema, { quantity: 3 }),
    );

    expect(updated.items[0].quantity).toBe(3);
    expect(updated.items[0].lineTotalCents).toBe(2700);
    expect(updated.subtotalCents).toBe(2700);
  });

  it("returns 404 when product is not active or does not exist", async () => {
    const cartRepository = new InMemoryCartRepository();
    const catalogRepository = new StaticCatalogRepository(null);

    await expect(
      addCartItem(cartRepository, catalogRepository, sessionId, {
        productId: product.id,
        quantity: 1,
      }),
    ).rejects.toMatchObject({
      problem: {
        status: 404,
        type: "not_found",
      },
    });
  });
});

class StaticCatalogRepository implements CatalogRepository {
  constructor(private readonly product: Product | null) {}

  async listActiveCategories() {
    return [];
  }

  async searchActiveProducts() {
    return {
      items: this.product ? [this.product] : [],
      page: 1,
      pageSize: 20,
      total: this.product ? 1 : 0,
    };
  }

  async findActiveProductById(productId: string) {
    return this.product?.id === productId ? this.product : null;
  }
}

class InMemoryCartRepository implements CartRepository {
  private cart: Cart | null = null;
  private readonly items = new Map<string, CartItem>();

  async findActiveCartBySessionId(requestedSessionId: string): Promise<CartWithItems | null> {
    if (!this.cart || this.cart.sessionId !== requestedSessionId || this.cart.status !== "Active") {
      return null;
    }

    return {
      cart: this.cart,
      items: [...this.items.values()],
    };
  }

  async createCart(requestedSessionId: string): Promise<Cart> {
    this.cart = {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      sessionId: requestedSessionId,
      status: "Active",
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };

    return this.cart;
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPriceCents: number,
  ): Promise<CartItem> {
    const existing = [...this.items.values()].find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.unitPriceCents = unitPriceCents;
      return existing;
    }

    const item: CartItem = {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      cartId,
      productId,
      quantity,
      unitPriceCents,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };

    this.items.set(item.id, item);
    return item;
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    const item = this.items.get(itemId);

    if (!item || item.cartId !== cartId) {
      return null;
    }

    item.quantity = quantity;
    return item;
  }

  async removeItem(cartId: string, itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);

    if (!item || item.cartId !== cartId) {
      return false;
    }

    return this.items.delete(itemId);
  }

  async clearCart(): Promise<void> {
    this.items.clear();
  }
}
