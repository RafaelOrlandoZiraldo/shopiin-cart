import type { Order } from "../domain/orders/order";
import type { OrderItem } from "../domain/orders/orderItem";
import type { PaymentStatus } from "../domain/payments/payment";

export type CreateOrderInput = {
  cartId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddressJson: string;
  idempotencyKey: string;
  items: Array<Omit<OrderItem, "id" | "orderId">>;
};

export type CreatedOrder = {
  order: Order;
  items: OrderItem[];
};

export interface OrderRepository {
  findByIdempotencyKey(idempotencyKey: string): Promise<CreatedOrder | null>;
  createPendingPaymentOrder(input: CreateOrderInput): Promise<CreatedOrder>;
  updatePaymentState(
    orderId: string,
    paymentStatus: PaymentStatus,
    orderStatus: Order["status"],
  ): Promise<Order | null>;
}
