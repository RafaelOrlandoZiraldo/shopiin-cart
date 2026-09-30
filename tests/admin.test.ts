import { describe, expect, it } from "vitest";
import { withAdminAuth } from "../functions/api/_shared/adminAuth";
import type { CloudflareEnv } from "../server/infrastructure/cloudflare/bindings";

describe("admin auth", () => {
  it("rejects requests without a valid bearer token", async () => {
    const handler = withAdminAuth(async () => new Response("ok"));

    await expect(
      handler({
        request: new Request("https://example.com/api/admin/categories"),
        env: { ADMIN_API_TOKEN: "secret" } as CloudflareEnv,
        params: {},
        data: {},
        next: async () => new Response(),
        waitUntil: () => undefined,
      }),
    ).rejects.toMatchObject({
      problem: {
        status: 401,
      },
    });
  });

  it("allows requests with a valid bearer token", async () => {
    const handler = withAdminAuth(async () => new Response("ok"));
    const response = await handler({
      request: new Request("https://example.com/api/admin/categories", {
        headers: { authorization: "Bearer secret" },
      }),
      env: { ADMIN_API_TOKEN: "secret" } as CloudflareEnv,
      params: {},
      data: {},
      next: async () => new Response(),
      waitUntil: () => undefined,
    });

    expect(await response.text()).toBe("ok");
  });
});
