import { describe, expect, it } from "vitest";
import { getHealth } from "../server/application/health/getHealth";
import { mapUnknownError } from "../server/shared/http/responses";

describe("health application service", () => {
  it("returns an ok status with a UTC timestamp", () => {
    const health = getHealth();

    expect(health.status).toBe("ok");
    expect(new Date(health.timestamp).toISOString()).toBe(health.timestamp);
  });
});

describe("global error mapping", () => {
  it("does not expose internal errors", () => {
    const problem = mapUnknownError(new Error("database exploded"));

    expect(problem).toEqual({
      type: "internal_server_error",
      title: "Internal server error",
      status: 500,
      detail: "An unexpected error occurred",
    });
  });
});
