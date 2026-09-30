import { AppError } from "../../../server/shared/http/appError";
import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { securityHeaders } from "../../../server/shared/http/responses";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestGet: PagesFunction<CloudflareEnv> = withErrorHandling(async ({ env, params }) => {
  const rawKey = params.key;
  const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
  const object = key ? await env.PRODUCT_IMAGES.get(key) : null;

  if (!object) {
    throw new AppError({
      type: "not_found",
      title: "Image not found",
      status: 404,
      detail: "The requested image was not found",
    });
  }

  return new Response(object.body as unknown as BodyInit, {
    headers: {
      ...securityHeaders,
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
});
