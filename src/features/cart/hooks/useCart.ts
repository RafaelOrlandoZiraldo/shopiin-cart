import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../api/cartApi";
import { getCartSessionId } from "../api/cartSession";

const cartQueryKey = ["cart"] as const;

export function useCart() {
  const queryClient = useQueryClient();
  const sessionId = getCartSessionId();

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => fetchCart(sessionId),
  });

  const invalidateCart = async () => {
    await queryClient.invalidateQueries({ queryKey: cartQueryKey });
  };

  const addItem = useMutation({
    mutationFn: (input: { productId: string; quantity?: number }) =>
      addCartItem(sessionId, {
        productId: input.productId,
        quantity: input.quantity ?? 1,
      }),
    onSuccess: invalidateCart,
  });

  const updateItem = useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) =>
      updateCartItem(sessionId, input.itemId, { quantity: input.quantity }),
    onSuccess: invalidateCart,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem(sessionId, itemId),
    onSuccess: invalidateCart,
  });

  const clear = useMutation({
    mutationFn: () => clearCart(sessionId),
    onSuccess: invalidateCart,
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    isFetching: cartQuery.isFetching,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}
