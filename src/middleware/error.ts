import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { errorResponse } from '../utils/responses';

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;  // Updated to handle both string and number codes
  errors?: any[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  logger.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (typeof err.code === 'number' && err.code === 11000) { // Fixed type checking
    statusCode = 409;
    errorMessage = 'Duplicate entry found';
  }

  // Prepare error details
  const errorDetails = process.env.NODE_ENV === 'development' 
    ? {
        code: err.code,
        errors: err.errors,
        stack: err.stack
      }
    : undefined;

  // Send error response
  res.status(statusCode).json(errorResponse(errorMessage, errorDetails));
};

// Handle 404 errors
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Handle async errors
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  statusCode: number;
  code?: string | number;  // Updated type
  errors?: any[];

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
