import { AppError } from "../../shared/http/appError";

export function cartItemNotFoundError(): AppError {
  return new AppError({
    type: "not_found",
    title: "Cart item not found",
    status: 404,
    detail: "The requested cart item was not found",
  });
}

export function productNotFoundError(): AppError {
  return new AppError({
    type: "not_found",
    title: "Product not found",
    status: 404,
    detail: "The requested product was not found",
  });
}
