import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔥 Error Handler caught:', err);

  // 1. Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // 2. Mongoose Validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: err.message,
      errors
    });
  }

  // 3. Mongoose Cast Error (invalid ID format)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field ${err.path}: ${err.value}`
    });
  }

  // 4. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate resource error. A record with this ${fields} already exists.`
    });
  }

  // 5. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired.'
    });
  }

  // 6. Generic/Custom Server Errors
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
