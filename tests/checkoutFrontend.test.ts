import { describe, expect, it, vi } from "vitest";
import { createCheckout } from "../src/features/checkout/api/checkoutApi";

describe("checkout API client", () => {
  it("sends cart session and idempotency headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        orderId: "order-id",
        status: "PendingPayment",
        totalCents: 900,
        payment: { redirectUrl: null },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createCheckout(
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
      {
        customer: {
          firstName: "Rafael",
          lastName: "Ziraldo",
          email: "rafael@example.com",
          phone: null,
        },
        shippingAddress: {
          line1: "Calle 123",
          line2: null,
          city: "Villa Regina",
          state: "Rio Negro",
          postalCode: "8336",
          country: "AR",
        },
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/checkout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Cart-Session": "55555555-5555-4555-8555-555555555555",
          "Idempotency-Key": "66666666-6666-4666-8666-666666666666",
        }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
