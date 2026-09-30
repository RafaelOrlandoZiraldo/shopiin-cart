import { describe, expect, it } from "vitest";
import type { Order } from "../server/domain/orders/order";
import type { Payment } from "../server/domain/payments/payment";
import { handlePaymentWebhook } from "../server/application/payments/handlePaymentWebhook";
import { FakePaymentProvider } from "../server/infrastructure/payments/fakePaymentProvider";
import type { OrderRepository } from "../server/repositories/orderRepository";
import type {
  CreatePaymentInput,
  PaymentRepository,
  RecordWebhookPaymentInput,
} from "../server/repositories/paymentRepository";

describe("payment provider", () => {
  it("creates fake pending payments without provider SDK coupling", async () => {
    const provider = new FakePaymentProvider();

    const result = await provider.createPayment({
      orderId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      amountCents: 1800,
      currency: "ARS",
      customerEmail: "rafael@example.com",
      idempotencyKey: "payment-key",
    });

    expect(result).toEqual({
      provider: "fake",
      providerPaymentId: "fake_eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      status: "Pending",
      redirectUrl: null,
    });
  });
});

describe("payment webhook", () => {
  it("records webhook once and transitions pending orders to paid", async () => {
    const payments = new InMemoryPaymentRepository();
    const orders = new InMemoryOrderRepository();

    const first = await handlePaymentWebhook(payments, orders, {
      provider: "fake",
      webhook: {
        eventId: "evt_1",
        orderId: orders.order.id,
        providerPaymentId: "fake_payment",
        status: "Paid",
        amountCents: 1800,
      },
    });
    const second = await handlePaymentWebhook(payments, orders, {
      provider: "fake",
      webhook: {
        eventId: "evt_1",
        orderId: orders.order.id,
        providerPaymentId: "fake_payment",
        status: "Paid",
        amountCents: 1800,
      },
    });

    expect(first.processed).toBe(true);
    expect(second.processed).toBe(false);
    expect(orders.order.status).toBe("Paid");
    expect(orders.order.paymentStatus).toBe("Paid");
  });
});

class InMemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, Payment>();

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    return this.save(input);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Payment | null> {
    return this.payments.get(idempotencyKey) ?? null;
  }

  async recordWebhookPayment(input: RecordWebhookPaymentInput): Promise<Payment> {
    return this.save(input);
  }

  private async save(input: CreatePaymentInput | RecordWebhookPaymentInput): Promise<Payment> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      orderId: input.orderId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      status: input.status,
      amountCents: input.amountCents,
      idempotencyKey: input.idempotencyKey,
      createdAt: "2026-09-29T00:00:00.000Z",
      updatedAt: "2026-09-29T00:00:00.000Z",
    };
    this.payments.set(input.idempotencyKey, payment);
    return payment;
  }
}

class InMemoryOrderRepository implements OrderRepository {
  order: Order = {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    cartId: "cart-id",
    email: "rafael@example.com",
    firstName: "Rafael",
    lastName: "Ziraldo",
    phone: null,
    status: "PendingPayment",
    paymentStatus: "Pending",
    subtotalCents: 1800,
    shippingCents: 0,
    totalCents: 1800,
    shippingAddressJson: "{}",
    idempotencyKey: "order-key",
    createdAt: "2026-09-29T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z",
  };

  async findByIdempotencyKey() {
    return null;
  }

  async createPendingPaymentOrder() {
    return { order: this.order, items: [] };
  }

  async updatePaymentState(
    orderId: string,
    paymentStatus: Order["paymentStatus"],
    orderStatus: Order["status"],
  ) {
    if (this.order.id !== orderId || this.order.status !== "PendingPayment") {
      return this.order;
    }

    this.order = {
      ...this.order,
      status: orderStatus,
      paymentStatus,
    };

    return this.order;
  }
}
