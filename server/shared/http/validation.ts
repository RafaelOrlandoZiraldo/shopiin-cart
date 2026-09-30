import { z } from "zod";
import { AppError } from "./appError";

export function validationErrorFromZod(error: z.ZodError): AppError {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "request";
    errors[key] = [...(errors[key] ?? []), issue.message];
  }

  return new AppError({
    type: "validation_error",
    title: "Validation failed",
    status: 400,
    detail: "One or more validation errors occurred",
    errors,
  });
}

export function parseDto<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}
