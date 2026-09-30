import type { OrderStatus } from "../../domain/orders/order";
import type { PaymentStatus } from "../../domain/payments/payment";
import type { OrderRepository } from "../../repositories/orderRepository";
import type { PaymentRepository } from "../../repositories/paymentRepository";
import type { PaymentWebhookDto } from "./dtos";

export type PaymentWebhookResult = {
  processed: boolean;
  paymentStatus: PaymentStatus;
};

export async function handlePaymentWebhook(
  paymentRepository: PaymentRepository,
  orderRepository: OrderRepository,
  input: {
    provider: string;
    webhook: PaymentWebhookDto;
  },
): Promise<PaymentWebhookResult> {
  const idempotencyKey = `${input.provider}:webhook:${input.webhook.eventId}`;
  const existingPayment = await paymentRepository.findByIdempotencyKey(idempotencyKey);

  if (existingPayment) {
    return {
      processed: false,
      paymentStatus: existingPayment.status,
    };
  }

  const payment = await paymentRepository.recordWebhookPayment({
    orderId: input.webhook.orderId,
    provider: input.provider,
    providerPaymentId: input.webhook.providerPaymentId,
    status: input.webhook.status,
    amountCents: input.webhook.amountCents,
    idempotencyKey,
  });

  const nextOrderStatus = getNextOrderStatus(payment.status);

  if (nextOrderStatus) {
    await orderRepository.updatePaymentState(payment.orderId, payment.status, nextOrderStatus);
  }

  return {
    processed: true,
    paymentStatus: payment.status,
  };
}

function getNextOrderStatus(paymentStatus: PaymentStatus): OrderStatus | null {
  if (paymentStatus === "Paid") {
    return "Paid";
  }

  if (paymentStatus === "Failed") {
    return "Failed";
  }

  return null;
}
