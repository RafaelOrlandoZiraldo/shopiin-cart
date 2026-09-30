import type { D1Database } from "@cloudflare/workers-types";
import type { CloudflareEnv } from "../cloudflare/bindings";

export function getD1Database(env: CloudflareEnv): D1Database {
  return env.DB;
}
