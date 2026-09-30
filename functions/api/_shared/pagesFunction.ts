export type PagesFunctionContext<TEnv = unknown> = {
  request: Request;
  env: TEnv;
  params: Record<string, string | string[]>;
  data: Record<string, unknown>;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
};

export type PagesFunction<TEnv = unknown> = (
  context: PagesFunctionContext<TEnv>,
) => Response | Promise<Response>;
