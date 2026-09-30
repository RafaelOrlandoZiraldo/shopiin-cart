export type PaymentStatus = "Pending" | "Paid" | "Failed";

export type Payment = {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string | null;
  status: PaymentStatus;
  amountCents: number;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
};
