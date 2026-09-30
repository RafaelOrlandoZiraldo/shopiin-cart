import type { CreatedOrder } from "../../repositories/orderRepository";

export type CheckoutResponseDto = {
  orderId: string;
  status: "PendingPayment";
  totalCents: number;
  payment: {
    redirectUrl: string | null;
  };
};

export function toCheckoutResponse(order: CreatedOrder): CheckoutResponseDto {
  return {
    orderId: order.order.id,
    status: "PendingPayment",
    totalCents: order.order.totalCents,
    payment: {
      redirectUrl: null,
    },
  };
}
