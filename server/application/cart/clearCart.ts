import type { CartRepository } from "../../repositories/cartRepository";
import { toCartDto, type CartDto } from "./cartDtos";
import { getOrCreateCart } from "./getCart";

export async function clearCart(repository: CartRepository, sessionId: string): Promise<CartDto> {
  const cart = await getOrCreateCart(repository, sessionId);
  await repository.clearCart(cart.cart.id);

  return toCartDto({
    cart: cart.cart,
    items: [],
  });
}
