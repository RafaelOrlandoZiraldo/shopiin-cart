export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
};

export class AppError extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.name = "AppError";
    this.problem = problem;
  }
}
