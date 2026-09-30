import type { CartRepository } from "../../repositories/cartRepository";
import { toCartDto, type CartDto } from "./cartDtos";
import { cartItemNotFoundError } from "./cartErrors";
import { getOrCreateCart } from "./getCart";

export async function removeCartItem(
  repository: CartRepository,
  sessionId: string,
  itemId: string,
): Promise<CartDto> {
  const cart = await getOrCreateCart(repository, sessionId);
  const removed = await repository.removeItem(cart.cart.id, itemId);

  if (!removed) {
    throw cartItemNotFoundError();
  }

  const updatedCart = await repository.findActiveCartBySessionId(sessionId);

  return toCartDto(updatedCart ?? { cart: cart.cart, items: [] });
}
