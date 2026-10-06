import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { withRateLimit } from "../functions/api/_shared/rateLimit";
import type { CloudflareEnv } from "../server/infrastructure/cloudflare/bindings";
import { jsonResponse } from "../server/shared/http/responses";

describe("security headers", () => {
  it("adds baseline security headers to JSON responses", () => {
    const response = jsonResponse({ ok: true });

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("content-security-policy")).toContain("default-src 'none'");
  });

  it("defines browser security headers for Cloudflare Pages assets", () => {
    const headersFile = readFileSync("public/_headers", "utf8");

    expect(headersFile).toContain("Strict-Transport-Security");
    expect(headersFile).toContain("Content-Security-Policy");
    expect(headersFile).toContain("frame-ancestors 'none'");
    expect(headersFile).toContain("https://fonts.googleapis.com");
    expect(headersFile).toContain("https://fonts.gstatic.com");
    expect(headersFile).toContain("script-src 'self' https://static.cloudflareinsights.com");
    expect(headersFile).toContain("https://cloudflareinsights.com");
    expect(headersFile).toContain("frame-src https://www.google.com https://maps.google.com");
    expect(headersFile).toContain("upgrade-insecure-requests");
  });
});

describe("rate limiting", () => {
  it("rejects requests after the configured limit", async () => {
    const env = { DB: new InMemoryRateLimitD1() } as unknown as CloudflareEnv;
    const handler = withRateLimit(
      { namespace: "test", limit: 1, windowSeconds: 60 },
      async () => new Response("ok"),
    );
    const context = {
      request: new Request("https://example.com/api/test", {
        headers: { "CF-Connecting-IP": "203.0.113.10" },
      }),
      env,
      params: {},
      data: {},
      next: async () => new Response(),
      waitUntil: () => undefined,
    };

    expect(await (await handler(context)).text()).toBe("ok");
    await expect(handler(context)).rejects.toMatchObject({
      problem: {
        status: 429,
        type: "rate_limited",
      },
    });
  });
});

class InMemoryRateLimitD1 {
  private readonly rows = new Map<string, { WindowStart: number; Count: number }>();

  prepare(sql: string) {
    return new InMemoryStatement(sql, this.rows);
  }
}

class InMemoryStatement {
  private args: unknown[] = [];

  constructor(
    private readonly sql: string,
    private readonly rows: Map<string, { WindowStart: number; Count: number }>,
  ) {}

  bind(...args: unknown[]) {
    this.args = args;
    return this;
  }

  async first<T>() {
    if (this.sql.startsWith("SELECT WindowStart")) {
      return (this.rows.get(String(this.args[0])) ?? null) as T | null;
    }
    return null;
  }

  async run() {
    if (this.sql.startsWith("INSERT OR REPLACE")) {
      this.rows.set(String(this.args[0]), {
        WindowStart: Number(this.args[1]),
        Count: 1,
      });
    }

    if (this.sql.startsWith("UPDATE RateLimits")) {
      const key = String(this.args[1]);
      const row = this.rows.get(key);
      if (row) {
        row.Count += 1;
      }
    }

    return { success: true };
  }
}
