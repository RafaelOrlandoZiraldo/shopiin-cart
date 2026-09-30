import { describe, expect, it } from "vitest";
import { getD1Database } from "../server/infrastructure/d1/database";
import type { CloudflareEnv } from "../server/infrastructure/cloudflare/bindings";

describe("D1 database helper", () => {
  it("returns the configured DB binding", () => {
    const db = { binding: "DB" };
    const env = { DB: db } as unknown as CloudflareEnv;

    expect(getD1Database(env)).toBe(db);
  });
});
