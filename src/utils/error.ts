export class CustomError extends Error {
  public status: number;
  public error: string;
  public details?: any;

  constructor(status: number, error: string, message?: string, details?: any) {
    super(message);
    this.status = status;
    this.error = error || this.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string, details?: any) {
    super(400, "BadRequestError", message, details);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(400, "ValidationError", message, details);
  }
}

export class UnAuthorizedError extends CustomError {
  constructor(message: string, details?: any) {
    super(401, "UnAuthorizedError", message, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string, details?: any) {
    super(403, "ForbiddenError", message, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, details?: any) {
    super(404, "NotFoundError", message, details);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(409, "ConflictError", message, details);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string, details?: any) {
    super(429, "RateLimitError", message, details);
  }
}

export class InternalError extends CustomError {
  constructor(message: string, details?: any) {
    super(500, "InternalError", message, details);
  }
}

export class NotImplementedError extends CustomError {
  constructor(message: string, details?: any) {
    super(501, "NotImplementedError", message, details);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message: string, details?: any) {
    super(503, "ServiceUnavailableError", message, details);
  }
}

export class SyncError extends CustomError {
  constructor(message: string, details?: any) {
    super(503, "SyncError", message, details);
  }
}

export class GatewayTimeoutError extends CustomError {
  constructor(message: string, details?: any) {
    super(504, "GatewayTimeoutError", message, details);
  }
}
