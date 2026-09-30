import { z } from "zod";

export const cartSessionHeaderSchema = z.object({
  cartSessionId: z.string().uuid("X-Cart-Session must be a valid UUID"),
});

export const cartItemIdParamsSchema = z.object({
  id: z.string().uuid("Must be a valid cart item id"),
});

export const addCartItemBodySchema = z.object({
  productId: z.string().uuid("Must be a valid product id"),
  quantity: z.number().int("Must be an integer").min(1, "Must be greater than zero"),
});

export const updateCartItemBodySchema = z.object({
  quantity: z.number().int("Must be an integer").min(1, "Must be greater than zero"),
});

export type CartSessionHeaderDto = z.infer<typeof cartSessionHeaderSchema>;
export type AddCartItemBodyDto = z.infer<typeof addCartItemBodySchema>;
export type UpdateCartItemBodyDto = z.infer<typeof updateCartItemBodySchema>;
