import { describe, expect, it, vi } from "vitest";
import { adminApi } from "../src/features/admin/api/adminApi";

describe("admin API client", () => {
  it("sends authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    await adminApi.listProducts("admin-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/products",
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: "Bearer admin-token",
        }),
      }),
    );
    vi.unstubAllGlobals();
  });
});
