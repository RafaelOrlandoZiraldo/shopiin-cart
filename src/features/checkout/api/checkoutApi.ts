import type { CheckoutRequestDto, CheckoutResponseDto } from "../types/checkout";

export async function createCheckout(
  sessionId: string,
  idempotencyKey: string,
  input: CheckoutRequestDto,
): Promise<CheckoutResponseDto> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-Cart-Session": sessionId,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Checkout failed with status ${response.status}`);
  }

  return response.json() as Promise<CheckoutResponseDto>;
}
