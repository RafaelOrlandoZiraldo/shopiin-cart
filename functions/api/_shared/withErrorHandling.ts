import { mapUnknownError, problemResponse } from "../../../server/shared/http/responses";
import type { PagesFunction } from "./pagesFunction";

type Handler<TEnv> = PagesFunction<TEnv>;

export function withErrorHandling<TEnv>(handler: Handler<TEnv>): Handler<TEnv> {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      const problem = mapUnknownError(error);
      console.error("http_request_failed", {
        path: new URL(context.request.url).pathname,
        method: context.request.method,
        status: problem.status,
        type: problem.type,
      });
      return problemResponse(problem);
    }
  };
}
