import jwt, { JwtPayload } from "jsonwebtoken";
import { getConfig, parseNumber } from "./config";
import { UnAuthorizedError } from "./error";
import logger from "./logger";

const secret = getConfig<string>("auth.jwt.secret");
const expiresIn = getConfig<number>("auth.jwt.expiresIn", parseNumber);

export const generateJwt = (payload: object): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJwt = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    switch (error?.name ?? "") {
      case "TokenExpiredError":
        logger.notice("Token expired", { error });
        break;
      case "JsonWebTokenError":
        logger.notice("Invalid token", { error });
        break;
      case "NotBeforeError":
        logger.notice("Token not active", { error });
        break;
      default:
        logger.warning("Token verification error", { error });
    }
    throw new UnAuthorizedError("Invalid token");
  }
};
