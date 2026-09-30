import type { CloudflareEnv } from "../../../server/infrastructure/cloudflare/bindings";
import { jsonResponse } from "../../../server/shared/http/responses";
import { AppError } from "../../../server/shared/http/appError";
import { withAdminAuth } from "../_shared/adminAuth";
import type { PagesFunction } from "../_shared/pagesFunction";
import { withRateLimit } from "../_shared/rateLimit";
import { withErrorHandling } from "../_shared/withErrorHandling";

export const onRequestPost: PagesFunction<CloudflareEnv> = withErrorHandling(withRateLimit({ namespace: "admin", limit: 60, windowSeconds: 60 }, withAdminAuth(async ({ request, env }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new AppError({
      type: "validation_error",
      title: "Validation failed",
      status: 400,
      detail: "Image file is required",
      errors: { file: ["Required"] },
    });
  }

  if (!file.type.startsWith("image/")) {
    throw new AppError({
      type: "validation_error",
      title: "Validation failed",
      status: 400,
      detail: "Only image uploads are allowed",
      errors: { file: ["Must be an image"] },
    });
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new AppError({
      type: "validation_error",
      title: "Validation failed",
      status: 400,
      detail: "Image file is too large",
      errors: { file: ["Must be 5MB or smaller"] },
    });
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `products/${crypto.randomUUID()}.${extension}`;
  await env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return jsonResponse({ key, url: `/api/images/${key}` }, { status: 201 });
})));
