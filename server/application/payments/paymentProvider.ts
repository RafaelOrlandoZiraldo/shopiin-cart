import type { PaymentStatus } from "../../domain/payments/payment";

export type CreatePaymentRequest = {
  orderId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  customerEmail: string;
};

export type CreatePaymentResult = {
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  redirectUrl: string | null;
};

export interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResult>;
}
