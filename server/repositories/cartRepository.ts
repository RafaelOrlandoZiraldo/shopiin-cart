import type { Cart } from "../domain/cart/cart";
import type { CartItem } from "../domain/cart/cartItem";

export type CartWithItems = {
  cart: Cart;
  items: CartItem[];
};

export interface CartRepository {
  findActiveCartBySessionId(sessionId: string): Promise<CartWithItems | null>;
  createCart(sessionId: string): Promise<Cart>;
  addItem(cartId: string, productId: string, quantity: number, unitPriceCents: number): Promise<CartItem>;
  updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartItem | null>;
  removeItem(cartId: string, itemId: string): Promise<boolean>;
  clearCart(cartId: string): Promise<void>;
}
