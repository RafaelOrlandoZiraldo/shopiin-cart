import { describe, expect, it, vi } from "vitest";
import type { Order } from "../server/domain/orders/order";
import type { Payment } from "../server/domain/payments/payment";
import { handlePaymentWebhook } from "../server/application/payments/handlePaymentWebhook";
import { FakePaymentProvider } from "../server/infrastructure/payments/fakePaymentProvider";
import { MercadoPagoPaymentProvider } from "../server/infrastructure/payments/mercadoPagoPaymentProvider";
import {
  isMercadoPagoWebhookConnectivityTest,
  parseMercadoPagoWebhook,
} from "../server/infrastructure/payments/mercadoPagoWebhook";
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

  it("creates Mercado Pago preferences without SDK coupling", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "pref_123",
        init_point: "https://mercadopago.test/checkout",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new MercadoPagoPaymentProvider({
      accessToken: "TEST-ACCESS-TOKEN",
      notificationUrl: "https://shop.example.com/api/payments/webhook/mercadopago",
      backUrlBase: "https://shop.example.com",
    });

    const result = await provider.createPayment({
      orderId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      amountCents: 1800,
      currency: "ARS",
      customerEmail: "rafael@example.com",
      idempotencyKey: "payment-key",
    });

    expect(result).toEqual({
      provider: "mercadopago",
      providerPaymentId: "pref_123",
      status: "Pending",
      redirectUrl: "https://mercadopago.test/checkout",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mercadopago.com/checkout/preferences",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer TEST-ACCESS-TOKEN",
          "x-idempotency-key": "payment-key",
        }),
        body: expect.stringContaining('"auto_return":"approved"'),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      external_reference: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      notification_url: "https://shop.example.com/api/payments/webhook/mercadopago",
      auto_return: "approved",
      back_urls: {
        success: "https://shop.example.com/checkout?payment=success",
        pending: "https://shop.example.com/checkout?payment=pending",
        failure: "https://shop.example.com/checkout?payment=failure",
      },
      metadata: {
        order_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        idempotency_key: "payment-key",
      },
    });

    vi.unstubAllGlobals();
  });
});

describe("Mercado Pago webhook", () => {
  it("detects Mercado Pago dashboard connectivity test payloads", () => {
    expect(isMercadoPagoWebhookConnectivityTest({
      action: "payment.updated",
      api_version: "v1",
      data: { id: "123456" },
      date_created: "2021-11-01T02:02:02Z",
      id: "123456",
      live_mode: false,
      type: "payment",
      user_id: 493860664,
    })).toBe(true);
  });

  it("validates signature, fetches payment details, and maps approved payments", async () => {
    const secret = "webhook-secret";
    const requestId = "request-id";
    const paymentId = "123456789";
    const ts = "1704908010";
    const signature = await hmacSha256Hex(
      secret,
      `id:${paymentId};request-id:${requestId};ts:${ts};`,
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: paymentId,
        status: "approved",
        transaction_amount: 18,
        external_reference: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const webhook = await parseMercadoPagoWebhook({
      request: new Request(`https://shop.example.com/api/payments/webhook/mercadopago?data.id=${paymentId}`, {
        method: "POST",
        headers: {
          "x-request-id": requestId,
          "x-signature": `ts=${ts},v1=${signature}`,
        },
      }),
      body: {
        id: 999,
        action: "payment.updated",
        data: { id: paymentId },
      },
      accessToken: "TEST-ACCESS-TOKEN",
      webhookSecret: secret,
    });

    expect(webhook).toEqual({
      eventId: "999",
      orderId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      providerPaymentId: paymentId,
      status: "Paid",
      amountCents: 1800,
    });

    vi.unstubAllGlobals();
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

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
