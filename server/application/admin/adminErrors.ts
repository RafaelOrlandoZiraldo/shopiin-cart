import { AppError } from "../../shared/http/appError";

export function notFoundError(resource: string): AppError {
  return new AppError({
    type: "not_found",
    title: `${resource} not found`,
    status: 404,
    detail: `The requested ${resource.toLowerCase()} was not found`,
  });
}
