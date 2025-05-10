import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../utils/error";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const details = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
  };
  return next(new NotFoundError("This endpoint does not exists.", details));
};

export const error = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, error, message, details, stack } = err as any;
  res.error(status, error, message, details, stack);
};
