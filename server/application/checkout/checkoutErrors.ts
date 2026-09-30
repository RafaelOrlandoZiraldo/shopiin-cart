import { AppError } from "../../shared/http/appError";

export function emptyCartError(): AppError {
  return new AppError({
    type: "empty_cart",
    title: "Cart is empty",
    status: 400,
    detail: "Cannot checkout an empty cart",
  });
}

export function unavailableProductError(): AppError {
  return new AppError({
    type: "product_unavailable",
    title: "Product unavailable",
    status: 409,
    detail: "One or more cart products are no longer available",
  });
}
