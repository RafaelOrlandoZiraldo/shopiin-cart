import type { CartWithItems } from "../../repositories/cartRepository";

export type CartItemDto = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type CartDto = {
  id: string;
  sessionId: string;
  items: CartItemDto[];
  subtotalCents: number;
};

export function toCartDto(cartWithItems: CartWithItems): CartDto {
  const items = cartWithItems.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.quantity * item.unitPriceCents,
  }));

  return {
    id: cartWithItems.cart.id,
    sessionId: cartWithItems.cart.sessionId,
    items,
    subtotalCents: items.reduce((subtotal, item) => subtotal + item.lineTotalCents, 0),
  };
}
