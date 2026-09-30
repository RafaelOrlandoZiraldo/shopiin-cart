import type { D1Database } from "@cloudflare/workers-types";
import type { Payment, PaymentStatus } from "../../domain/payments/payment";
import type {
  CreatePaymentInput,
  PaymentRepository,
  RecordWebhookPaymentInput,
} from "../../repositories/paymentRepository";

type PaymentRow = {
  Id: string;
  OrderId: string;
  Provider: string;
  ProviderPaymentId: string | null;
  Status: PaymentStatus;
  AmountCents: number;
  IdempotencyKey: string | null;
  CreatedAt: string;
  UpdatedAt: string;
};

export class D1PaymentRepository implements PaymentRepository {
  constructor(private readonly db: D1Database) {}

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const paymentId = crypto.randomUUID();

    await this.db
      .prepare(
        `INSERT INTO Payments (
           Id, OrderId, Provider, ProviderPaymentId, Status, AmountCents, IdempotencyKey, CreatedAt, UpdatedAt
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        paymentId,
        input.orderId,
        input.provider,
        input.providerPaymentId,
        input.status,
        input.amountCents,
        input.idempotencyKey,
        now,
        now,
      )
      .run();

    const payment = await this.findByIdempotencyKey(input.idempotencyKey);

    if (!payment) {
      throw new Error("Payment could not be loaded after creation");
    }

    return payment;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Payment | null> {
    const row = await this.db
      .prepare(
        `SELECT Id, OrderId, Provider, ProviderPaymentId, Status, AmountCents,
                IdempotencyKey, CreatedAt, UpdatedAt
         FROM Payments
         WHERE IdempotencyKey = ?`,
      )
      .bind(idempotencyKey)
      .first<PaymentRow>();

    return row ? mapPaymentRow(row) : null;
  }

  async recordWebhookPayment(input: RecordWebhookPaymentInput): Promise<Payment> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const paymentId = crypto.randomUUID();

    await this.db
      .prepare(
        `INSERT INTO Payments (
           Id, OrderId, Provider, ProviderPaymentId, Status, AmountCents, IdempotencyKey, CreatedAt, UpdatedAt
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        paymentId,
        input.orderId,
        input.provider,
        input.providerPaymentId,
        input.status,
        input.amountCents,
        input.idempotencyKey,
        now,
        now,
      )
      .run();

    const payment = await this.findByIdempotencyKey(input.idempotencyKey);

    if (!payment) {
      throw new Error("Webhook payment could not be loaded after creation");
    }

    return payment;
  }
}

function mapPaymentRow(row: PaymentRow): Payment {
  return {
    id: row.Id,
    orderId: row.OrderId,
    provider: row.Provider,
    providerPaymentId: row.ProviderPaymentId,
    status: row.Status,
    amountCents: row.AmountCents,
    idempotencyKey: row.IdempotencyKey,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}
