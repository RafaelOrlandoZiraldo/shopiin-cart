import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .catch(undefined);

const paginationNumber = (defaultValue: number, maxValue?: number) =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined || value.trim() === "" ? defaultValue : Number(value)))
    .pipe(
      z
        .number({
          invalid_type_error: "Must be a number",
        })
        .int("Must be an integer")
        .min(1, "Must be greater than zero")
        .max(maxValue ?? Number.MAX_SAFE_INTEGER),
    );

export const listProductsQuerySchema = z.object({
  category: optionalTrimmedString,
  search: optionalTrimmedString,
  page: paginationNumber(1),
  pageSize: paginationNumber(20, 100),
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid("Must be a valid product id"),
});

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
export type ProductIdParamsDto = z.infer<typeof productIdParamsSchema>;
