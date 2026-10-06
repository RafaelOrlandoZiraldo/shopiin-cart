import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export type CloudflareEnv = {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  ADMIN_API_TOKEN?: string;
  PAYMENT_PROVIDER?: "fake" | "mercadopago";
  PAYMENT_PROVIDER_SECRET?: string;
  PAYMENT_WEBHOOK_SECRET?: string;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  MERCADOPAGO_NOTIFICATION_URL?: string;
  MERCADOPAGO_BACK_URL_BASE?: string;
  MERCADOPAGO_STATEMENT_DESCRIPTOR?: string;
};
