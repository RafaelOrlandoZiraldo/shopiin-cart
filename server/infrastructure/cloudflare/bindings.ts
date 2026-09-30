import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export type CloudflareEnv = {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  ADMIN_API_TOKEN?: string;
  PAYMENT_PROVIDER_SECRET?: string;
  PAYMENT_WEBHOOK_SECRET?: string;
};
