export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};
