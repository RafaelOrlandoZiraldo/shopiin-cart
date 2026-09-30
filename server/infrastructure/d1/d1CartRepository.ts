import type { D1Database } from "@cloudflare/workers-types";
import type { Cart, CartStatus } from "../../domain/cart/cart";
import type { CartItem } from "../../domain/cart/cartItem";
import type { CartRepository, CartWithItems } from "../../repositories/cartRepository";

type CartRow = {
  Id: string;
  SessionId: string;
  Status: CartStatus;
  CreatedAt: string;
  UpdatedAt: string;
};

type CartItemRow = {
  Id: string;
  CartId: string;
  ProductId: string;
  Quantity: number;
  UnitPriceCents: number;
  CreatedAt: string;
  UpdatedAt: string;
};

type ChangesRow = {
  Changes: number;
};

export class D1CartRepository implements CartRepository {
  constructor(private readonly db: D1Database) {}

  async findActiveCartBySessionId(sessionId: string): Promise<CartWithItems | null> {
    const cartRow = await this.db
      .prepare(
        `SELECT Id, SessionId, Status, CreatedAt, UpdatedAt
         FROM Carts
         WHERE SessionId = ? AND Status = 'Active'`,
      )
      .bind(sessionId)
      .first<CartRow>();

    if (!cartRow) {
      return null;
    }

    const itemsResult = await this.db
      .prepare(
        `SELECT Id, CartId, ProductId, Quantity, UnitPriceCents, CreatedAt, UpdatedAt
         FROM CartItems
         WHERE CartId = ?
         ORDER BY CreatedAt ASC`,
      )
      .bind(cartRow.Id)
      .all<CartItemRow>();

    return {
      cart: mapCartRow(cartRow),
      items: itemsResult.results.map(mapCartItemRow),
    };
  }

  async createCart(sessionId: string): Promise<Cart> {
    const now = new Date().toISOString();
    const cart: Cart = {
      id: crypto.randomUUID(),
      sessionId,
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };

    await this.db
      .prepare(
        `INSERT INTO Carts (Id, SessionId, Status, CreatedAt, UpdatedAt)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(cart.id, cart.sessionId, cart.status, cart.createdAt, cart.updatedAt)
      .run();

    return cart;
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPriceCents: number,
  ): Promise<CartItem> {
    const now = new Date().toISOString();
    const itemId = crypto.randomUUID();

    await this.db
      .prepare(
        `INSERT INTO CartItems (Id, CartId, ProductId, Quantity, UnitPriceCents, CreatedAt, UpdatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (CartId, ProductId) DO UPDATE SET
           Quantity = CartItems.Quantity + excluded.Quantity,
           UnitPriceCents = excluded.UnitPriceCents,
           UpdatedAt = excluded.UpdatedAt`,
      )
      .bind(itemId, cartId, productId, quantity, unitPriceCents, now, now)
      .run();

    await this.touchCart(cartId, now);

    const item = await this.findItemByCartAndProduct(cartId, productId);

    if (!item) {
      throw new Error("Cart item could not be loaded after insert");
    }

    return item;
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `UPDATE CartItems
         SET Quantity = ?, UpdatedAt = ?
         WHERE Id = ? AND CartId = ?`,
      )
      .bind(quantity, now, itemId, cartId)
      .run();

    const item = await this.findItemById(cartId, itemId);

    if (item) {
      await this.touchCart(cartId, now);
    }

    return item;
  }

  async removeItem(cartId: string, itemId: string): Promise<boolean> {
    await this.db
      .prepare(
        `DELETE FROM CartItems
         WHERE Id = ? AND CartId = ?`,
      )
      .bind(itemId, cartId)
      .run();

    const changes = await this.db.prepare("SELECT changes() AS Changes").first<ChangesRow>();

    if ((changes?.Changes ?? 0) > 0) {
      await this.touchCart(cartId, new Date().toISOString());
      return true;
    }

    return false;
  }

  async clearCart(cartId: string): Promise<void> {
    await this.db
      .prepare(
        `DELETE FROM CartItems
         WHERE CartId = ?`,
      )
      .bind(cartId)
      .run();

    await this.touchCart(cartId, new Date().toISOString());
  }

  private async findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    const row = await this.db
      .prepare(
        `SELECT Id, CartId, ProductId, Quantity, UnitPriceCents, CreatedAt, UpdatedAt
         FROM CartItems
         WHERE CartId = ? AND ProductId = ?`,
      )
      .bind(cartId, productId)
      .first<CartItemRow>();

    return row ? mapCartItemRow(row) : null;
  }

  private async findItemById(cartId: string, itemId: string): Promise<CartItem | null> {
    const row = await this.db
      .prepare(
        `SELECT Id, CartId, ProductId, Quantity, UnitPriceCents, CreatedAt, UpdatedAt
         FROM CartItems
         WHERE CartId = ? AND Id = ?`,
      )
      .bind(cartId, itemId)
      .first<CartItemRow>();

    return row ? mapCartItemRow(row) : null;
  }

  private async touchCart(cartId: string, updatedAt: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE Carts
         SET UpdatedAt = ?
         WHERE Id = ?`,
      )
      .bind(updatedAt, cartId)
      .run();
  }
}

function mapCartRow(row: CartRow): Cart {
  return {
    id: row.Id,
    sessionId: row.SessionId,
    status: row.Status,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

function mapCartItemRow(row: CartItemRow): CartItem {
  return {
    id: row.Id,
    cartId: row.CartId,
    productId: row.ProductId,
    quantity: row.Quantity,
    unitPriceCents: row.UnitPriceCents,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}
