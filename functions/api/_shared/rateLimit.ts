import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { AppError } from "../../../server/shared/http/appError";
import type { PagesFunction } from "./pagesFunction";

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitRow = {
  WindowStart: number;
  Count: number;
};

export function withRateLimit(
  options: RateLimitOptions,
  handler: PagesFunction<CloudflareEnv>,
): PagesFunction<CloudflareEnv> {
  return async (context) => {
    await assertRateLimit(context.request, context.env, options);
    return handler(context);
  };
}

async function assertRateLimit(
  request: Request,
  env: CloudflareEnv,
  options: RateLimitOptions,
): Promise<void> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = nowSeconds - (nowSeconds % options.windowSeconds);
  const key = `${options.namespace}:${clientKey(request)}`;
  const existing = await env.DB.prepare(
    "SELECT WindowStart, Count FROM RateLimits WHERE Key = ?",
  ).bind(key).first<RateLimitRow>();

  if (!existing || existing.WindowStart !== windowStart) {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO RateLimits (Key, WindowStart, Count, UpdatedAt) VALUES (?, ?, 1, ?)",
    ).bind(key, windowStart, new Date().toISOString()).run();
    return;
  }

  if (existing.Count >= options.limit) {
    throw new AppError({
      type: "rate_limited",
      title: "Too many requests",
      status: 429,
      detail: "Too many requests. Please retry later.",
    });
  }

  await env.DB.prepare(
    "UPDATE RateLimits SET Count = Count + 1, UpdatedAt = ? WHERE Key = ?",
  ).bind(new Date().toISOString(), key).run();
}

function clientKey(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
