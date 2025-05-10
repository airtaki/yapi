import { pick } from "accept-language-parser";
import { NextFunction, Request, Response } from "express";
import { getConfig, parseArray } from "../utils/config";

const supportedLanguages = getConfig<string[]>(
  "supportedLanguages",
  parseArray
);

export const requestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const acceptLanguages = req.headers["accept-language"] as string;
  req.locale =
    pick(supportedLanguages, acceptLanguages) ?? supportedLanguages[0];

  req.validArguments = new Map<string, any>();
  req.setValidArguments = (key, value) => {
    req.validArguments.set(key, value);
  };
  req.getValidArguments = (key) => {
    return req.validArguments.get(key);
  };
  req.getIp = () => {
    const ip = (
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip ||
      "0.0.0.0"
    ).toString();
    return ip.split(',')[0].trim();
  };
  next();
};
