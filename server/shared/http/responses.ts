import { AppError, type ProblemDetails } from "./appError";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cache-control": "no-store",
};

export const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

export function jsonResponse<TBody>(body: TBody, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init?.headers,
    },
  });
}

export function problemResponse(problem: ProblemDetails): Response {
  return jsonResponse(problem, { status: problem.status });
}

export function mapUnknownError(error: unknown): ProblemDetails {
  if (error instanceof AppError) {
    return error.problem;
  }

  return {
    type: "internal_server_error",
    title: "Internal server error",
    status: 500,
    detail: "An unexpected error occurred",
  };
}
