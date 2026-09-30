import type { CatalogRepository } from "../../repositories/catalogRepository";
import type { CartRepository } from "../../repositories/cartRepository";
import { toCartDto, type CartDto } from "./cartDtos";
import { getOrCreateCart } from "./getCart";
import { productNotFoundError } from "./cartErrors";
import type { AddCartItemBodyDto } from "./dtos";

export async function addCartItem(
  cartRepository: CartRepository,
  catalogRepository: CatalogRepository,
  sessionId: string,
  input: AddCartItemBodyDto,
): Promise<CartDto> {
  const product = await catalogRepository.findActiveProductById(input.productId);

  if (!product) {
    throw productNotFoundError();
  }

  const cart = await getOrCreateCart(cartRepository, sessionId);
  await cartRepository.addItem(cart.cart.id, product.id, input.quantity, product.priceCents);
  const updatedCart = await cartRepository.findActiveCartBySessionId(sessionId);

  return toCartDto(updatedCart ?? { cart: cart.cart, items: [] });
}
