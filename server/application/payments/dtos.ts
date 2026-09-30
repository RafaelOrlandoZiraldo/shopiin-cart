import { z } from "zod";

export const paymentProviderParamsSchema = z.object({
  provider: z.string().trim().min(1, "Provider is required").max(40),
});

export const paymentWebhookSchema = z.object({
  eventId: z.string().trim().min(1, "eventId is required"),
  orderId: z.string().uuid("orderId must be a valid UUID"),
  providerPaymentId: z.string().trim().min(1, "providerPaymentId is required"),
  status: z.enum(["Pending", "Paid", "Failed"]),
  amountCents: z.number().int().min(0),
});

export type PaymentWebhookDto = z.infer<typeof paymentWebhookSchema>;
