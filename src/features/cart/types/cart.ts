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
