import type { Payment, PaymentStatus } from "../domain/payments/payment";

export type CreatePaymentInput = {
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  amountCents: number;
  idempotencyKey: string;
};

export type RecordWebhookPaymentInput = {
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  amountCents: number;
  idempotencyKey: string;
};

export interface PaymentRepository {
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Payment | null>;
  recordWebhookPayment(input: RecordWebhookPaymentInput): Promise<Payment>;
}
