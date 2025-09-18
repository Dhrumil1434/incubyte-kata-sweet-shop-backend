import { StatusCodes, getReasonPhrase } from 'http-status-codes';

interface ErrorDetail {
  field: string;
  message: string;
}

interface DataDetail {
  expectedField: string;
  description: string;
}

class ApiError extends Error {
  action: string;
  statusCode: number;
  errorCode: string;
  success: boolean;
  errors: ErrorDetail[];
  data: DataDetail[];
  location?: string; // <-- Add location property

  constructor(
    action: string = 'INTERNAL_ACTION',
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: string = 'INTERNAL_ERROR',
    message: string = getReasonPhrase(statusCode),
    errors: ErrorDetail[] = [],
    data: DataDetail[] = [],
    stack: string = ''
  ) {
    super(message);
    this.action = action;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.success = false;
    this.errors = errors;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Parse the stack trace to get the first relevant line (excluding this constructor)
    if (this.stack) {
      const stackLines = this.stack.split('\n');
      // Find the first stack line outside of ApiError constructor
      const relevantLine = stackLines.find(
        (line) => !line.includes('ApiError') && line.includes('at ')
      );
      if (relevantLine) {
        // Example: at Object.<anonymous> (/path/to/file.ts:10:15)
        const match = relevantLine.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          this.location = match[1]; // file:line:column
        }
      }
    }
  }
}

export { ApiError };
export type { ErrorDetail, DataDetail };
