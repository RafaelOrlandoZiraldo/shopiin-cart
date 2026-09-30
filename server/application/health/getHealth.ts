import { healthResponseSchema, type HealthResponse } from "../../domain/health/health";

export function getHealth(): HealthResponse {
  return healthResponseSchema.parse({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
