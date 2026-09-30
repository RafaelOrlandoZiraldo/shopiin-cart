import type { CartRepository, CartWithItems } from "../../repositories/cartRepository";
import { toCartDto, type CartDto } from "./cartDtos";

export async function getCart(repository: CartRepository, sessionId: string): Promise<CartDto> {
  const cart = await getOrCreateCart(repository, sessionId);

  return toCartDto(cart);
}

export async function getOrCreateCart(
  repository: CartRepository,
  sessionId: string,
): Promise<CartWithItems> {
  const existingCart = await repository.findActiveCartBySessionId(sessionId);

  if (existingCart) {
    return existingCart;
  }

  const cart = await repository.createCart(sessionId);

  return {
    cart,
    items: [],
  };
}
