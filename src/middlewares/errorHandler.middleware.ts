import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
import { ApiError } from '@utils-core';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const errorCode = isApiError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isApiError ? err.message : 'Something went wrong';
  const errors = isApiError ? err.errors : [];
  const data = isApiError ? err.data : null;
  const success = isApiError ? err.success : false;
  const action = isApiError ? err.action : null;

  // Log error with context
  console.error(
    chalk.red(
      `[${new Date().toISOString()}] [${req.method} ${req.originalUrl}] ${errorCode}: ${message}`
    )
  );
  if (errors.length > 0) {
    console.error(
      chalk.yellow('Details:'),
      chalk.cyan(JSON.stringify(errors, null, 2))
    );
    if (data) {
      console.error(
        chalk.yellow('Data:'),
        chalk.cyan(JSON.stringify(data, null, 2))
      );
    }
  }
  if (!isApiError && process.env['NODE_ENV'] !== 'production') {
    console.error(chalk.gray(err.stack));
  }

  res.status(statusCode).json({
    success,
    action,
    errorCode,
    message,
    errors,
    data,
  });
};

export { errorHandler };
