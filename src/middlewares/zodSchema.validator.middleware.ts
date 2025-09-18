import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils';

const handleValidation = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string,
  next: NextFunction
): T | undefined => {
  try {
    const value = schema.parse(data);
    return value;
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      next(
        new ApiError(
          'VALIDATION_ERROR',
          StatusCodes.BAD_REQUEST,
          `INVALID_REQUEST_${label.toUpperCase()}`,
          `Request ${label} validation failed`,
          errors
        )
      );
      return undefined;
    }

    next(
      new ApiError(
        'INTERNAL_SERVER_ERROR',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'UNEXPECTED_ERROR',
        `An unexpected error occurred during ${label} validation.`
      )
    );
    return undefined;
  }
};

export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validated = handleValidation(schema, req.body, 'body', next);
    if (validated !== undefined) {
      req.body = validated as any;
      next();
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validated = handleValidation(schema, req.params, 'params', next);
    if (validated !== undefined) {
      req.params = validated as any;
      next();
    }
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validated = handleValidation(schema, req.query, 'query', next);
    if (validated !== undefined) {
      (req as any).validatedQuery = validated as any;
      next();
    }
  };
};
