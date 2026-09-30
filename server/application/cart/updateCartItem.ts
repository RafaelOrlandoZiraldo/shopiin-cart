import type { CartRepository } from "../../repositories/cartRepository";
import { toCartDto, type CartDto } from "./cartDtos";
import { cartItemNotFoundError } from "./cartErrors";
import { getOrCreateCart } from "./getCart";
import type { UpdateCartItemBodyDto } from "./dtos";

export async function updateCartItem(
  repository: CartRepository,
  sessionId: string,
  itemId: string,
  input: UpdateCartItemBodyDto,
): Promise<CartDto> {
  const cart = await getOrCreateCart(repository, sessionId);
  const updatedItem = await repository.updateItemQuantity(cart.cart.id, itemId, input.quantity);

  if (!updatedItem) {
    throw cartItemNotFoundError();
  }

  const updatedCart = await repository.findActiveCartBySessionId(sessionId);

  return toCartDto(updatedCart ?? { cart: cart.cart, items: [] });
}
