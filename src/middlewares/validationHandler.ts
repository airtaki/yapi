import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/error';

export const validationHandler = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new ValidationError('Validation failed', result.array()));
  }
  return next();
};
