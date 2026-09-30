import type { PaymentStatus } from "../payments/payment";

export type OrderStatus = "PendingPayment" | "Paid" | "Cancelled" | "Failed" | "Completed";

export type Order = {
  id: string;
  cartId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddressJson: string;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
};
