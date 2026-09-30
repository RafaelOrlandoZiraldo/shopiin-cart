import { z } from "zod";

const text = z.string().trim().min(1, "Required");
const nullableText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const idParamsSchema = z.object({
  id: z.string().uuid("Must be a valid id"),
});

export const upsertCategorySchema = z.object({
  name: text,
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-friendly slug"),
  active: z.boolean().optional().default(true),
});

export const upsertProductSchema = z.object({
  categoryId: z.string().uuid("Must be a valid category id"),
  name: text,
  description: nullableText,
  priceCents: z.number().int().min(0),
  imageUrl: nullableText,
  active: z.boolean().optional().default(true),
});

export const productStatusSchema = z.object({
  active: z.boolean(),
});

export type UpsertCategoryDto = z.infer<typeof upsertCategorySchema>;
export type UpsertProductDto = z.infer<typeof upsertProductSchema>;
