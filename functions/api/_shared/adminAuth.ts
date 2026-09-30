import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { AppError } from "../../../server/shared/http/appError";
import type { PagesFunction } from "./pagesFunction";

export function withAdminAuth(handler: PagesFunction<CloudflareEnv>): PagesFunction<CloudflareEnv> {
  return async (context) => {
    const configuredToken = context.env.ADMIN_API_TOKEN;
    const authorization = context.request.headers.get("Authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

    if (!configuredToken) {
      throw new AppError({
        type: "admin_auth_not_configured",
        title: "Admin auth is not configured",
        status: 500,
        detail: "Admin authentication is not configured",
      });
    }

    if (!safeTokenEquals(token, configuredToken)) {
      throw new AppError({
        type: "unauthorized",
        title: "Unauthorized",
        status: 401,
        detail: "Valid admin credentials are required",
      });
    }

    return handler(context);
  };
}

function safeTokenEquals(received: string, expected: string): boolean {
  if (received.length !== expected.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }

  return diff === 0;
}
