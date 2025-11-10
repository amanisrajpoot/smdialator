export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }
}

export const httpErrors = {
  badRequest: (message = "Bad Request", details?: unknown) => new ApiError(400, message, details),
  unauthorized: (message = "Unauthorized", details?: unknown) => new ApiError(401, message, details),
  forbidden: (message = "Forbidden", details?: unknown) => new ApiError(403, message, details),
  notFound: (message = "Not Found", details?: unknown) => new ApiError(404, message, details),
  conflict: (message = "Conflict", details?: unknown) => new ApiError(409, message, details),
  unprocessable: (message = "Unprocessable Entity", details?: unknown) => new ApiError(422, message, details),
  tooManyRequests: (message = "Too Many Requests", details?: unknown) => new ApiError(429, message, details),
  internal: (message = "Internal Server Error", details?: unknown) => new ApiError(500, message, details),
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
