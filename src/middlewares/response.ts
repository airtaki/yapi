import { NextFunction, Request, Response } from "express";
import { getConfig, parseBoolean } from "../utils/config";
import { maskSensitiveData } from "../utils/mask";

const showErrors = getConfig<boolean>("showStackErrors", parseBoolean);

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
  error?: any;
  details?: any;
  server?: any;
  env?: any;
  stack?: any;
}

export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.success = (status = 200, message = "Success", data?) => {
    const response: ApiResponse = {
      success: true,
      status,
      message,
      data,
    };
    res.status(status).json(response);
  };

  res.error = (status = 500, error, message?, details?, stack?) => {
    const server = {
      headers: req.headers,
      cookies: req.cookies,
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      path: req.path,
      hostname: req.hostname,
      ip: req.ip,
      query: req.query,
      body: req.body,
    };
    const response: ApiResponse = {
      success: false,
      status,
      error: error || "Internal Server Error",
      message: message || "Something went wrong",
      details: maskSensitiveData(details),
      stack: showErrors ? maskSensitiveData(stack) : undefined,
      server: showErrors ? maskSensitiveData(server) : undefined,
      env: showErrors ? maskSensitiveData(process.env) : undefined,
    };
    res.status(status).json(response);
  };

  return next();
};
