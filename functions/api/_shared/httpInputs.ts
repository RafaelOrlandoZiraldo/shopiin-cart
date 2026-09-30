import { z } from "zod";
import { cartSessionHeaderSchema } from "../../../server/application/cart/dtos";
import { AppError } from "../../../server/shared/http/appError";
import { parseDto } from "../../../server/shared/http/validation";

export function readCartSessionId(request: Request): string {
  return parseDto(cartSessionHeaderSchema, {
    cartSessionId: request.headers.get("X-Cart-Session"),
  }).cartSessionId;
}

export function readStringParam(
  params: Record<string, string | string[]>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError({
      type: "validation_error",
      title: "Validation failed",
      status: 400,
      detail: "Request body must be valid JSON",
      errors: {
        body: ["Must be valid JSON"],
      },
    });
  }
}

export function parseParams<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  params: Record<string, string | string[]>,
): z.output<TSchema> {
  return parseDto(
    schema,
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
    ),
  );
}
