import jwt, { JwtPayload } from "jsonwebtoken";
import { getConfig, parseNumber } from "./config";
import { UnAuthorizedError } from "./error";
import logger from "./logger";

const secret = getConfig<string>("auth.jwt.secret");
const expiresIn = getConfig<number>("auth.jwt.expiresIn", parseNumber);

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    switch (error?.name ?? "") {
      case "TokenExpiredError":
        logger.error("Token expired", { error });
        break;
      case "JsonWebTokenError":
        logger.error("Invalid token", { error });
        break;
      case "NotBeforeError":
        logger.error("Token not active", { error });
        break;
      default:
        logger.error("Token verification error", { error });
    }
    throw new UnAuthorizedError("Invalid token");
  }
};
