import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCartSessionId } from "../../cart/api/cartSession";
import { createCheckout } from "../api/checkoutApi";
import type { CheckoutRequestDto } from "../types/checkout";

export function useCheckout() {
  const queryClient = useQueryClient();
  const sessionId = getCartSessionId();

  return useMutation({
    mutationFn: (input: { checkout: CheckoutRequestDto; idempotencyKey: string }) =>
      createCheckout(sessionId, input.idempotencyKey, input.checkout),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
