import { beforeEach, describe, expect, it, vi } from "vitest";
import { addCartItem } from "../src/features/cart/api/cartApi";
import { getCartSessionId } from "../src/features/cart/api/cartSession";

describe("cart session", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps a stable cart session id in localStorage", () => {
    const first = getCartSessionId();
    const second = getCartSessionId();

    expect(first).toBe(second);
    expect(window.localStorage.getItem("shopping-cart-session-id")).toBe(first);
  });
});

describe("cart API client", () => {
  it("sends the cart session header when adding items", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cart-id",
        sessionId: "session-id",
        items: [],
        subtotalCents: 0,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await addCartItem("55555555-5555-4555-8555-555555555555", {
      productId: "33333333-3333-4333-8333-333333333331",
      quantity: 1,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cart/items",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Cart-Session": "55555555-5555-4555-8555-555555555555",
        }),
        body: JSON.stringify({
          productId: "33333333-3333-4333-8333-333333333331",
          quantity: 1,
        }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
