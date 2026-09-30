import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");
const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const checkoutRequestSchema = z.object({
  customer: z.object({
    firstName: requiredString,
    lastName: requiredString,
    email: z.string().trim().email("Must be a valid email"),
    phone: optionalString,
  }),
  shippingAddress: z.object({
    line1: requiredString,
    line2: optionalString,
    city: requiredString,
    state: requiredString,
    postalCode: requiredString,
    country: requiredString.length(2, "Use a two-letter country code"),
  }),
});

export const checkoutHeadersSchema = z.object({
  cartSessionId: z.string().uuid("X-Cart-Session must be a valid UUID"),
  idempotencyKey: z.string().uuid("Idempotency-Key must be a valid UUID"),
});

export type CheckoutRequestDto = z.infer<typeof checkoutRequestSchema>;
export type CheckoutHeadersDto = z.infer<typeof checkoutHeadersSchema>;
