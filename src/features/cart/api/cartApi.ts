import type { CartDto } from "../types/cart";

type CartRequestOptions = {
  sessionId: string;
  method?: string;
  body?: unknown;
};

async function requestCart(url: string, options: CartRequestOptions): Promise<CartDto> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-Cart-Session": options.sessionId,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Cart request failed with status ${response.status}`);
  }

  return response.json() as Promise<CartDto>;
}

export function fetchCart(sessionId: string): Promise<CartDto> {
  return requestCart("/api/cart", { sessionId });
}

export function addCartItem(
  sessionId: string,
  input: { productId: string; quantity: number },
): Promise<CartDto> {
  return requestCart("/api/cart/items", {
    sessionId,
    method: "POST",
    body: input,
  });
}

export function updateCartItem(
  sessionId: string,
  itemId: string,
  input: { quantity: number },
): Promise<CartDto> {
  return requestCart(`/api/cart/items/${itemId}`, {
    sessionId,
    method: "PUT",
    body: input,
  });
}

export function removeCartItem(sessionId: string, itemId: string): Promise<CartDto> {
  return requestCart(`/api/cart/items/${itemId}`, {
    sessionId,
    method: "DELETE",
  });
}

export function clearCart(sessionId: string): Promise<CartDto> {
  return requestCart("/api/cart", {
    sessionId,
    method: "DELETE",
  });
}
