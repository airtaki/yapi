import { Request, Response, NextFunction } from 'express';
import { UnAuthorizedError } from '../utils/error';
import { getConfig, parseArray } from "../utils/config";
import { verifyJwt } from '../utils/jwt';
import { PublicUser, User } from '../types/user';
import logger from '../utils/logger';

const internalAuthToken = getConfig<string>('auth.internal.token');
const externalAuthToken = getConfig<string>('auth.external.token');
const externalAuthTokenName = getConfig<string>('auth.external.tokenName');
const whitelistedIps = getConfig<string[]>('auth.external.ipWhiteList', parseArray);

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    logger.notice('No token provided');
    return next(new UnAuthorizedError('No token provided'));
  }
  try {
    const user = verifyJwt(token) as PublicUser;
    req.user = user;
  } catch (error) {
    return next(new UnAuthorizedError('Access denied'));
  }
  return next();
};

export const internalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token !== internalAuthToken) {
      logger.notice('Internal token verification error');
      throw new UnAuthorizedError('Access denied');
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export const externalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // IP validation:
    const ip = req.getIp();
    if (whitelistedIps.length > 0 && !whitelistedIps.includes(ip)) {
      logger.notice('IP not whitelisted', { ip });
      throw new UnAuthorizedError('Access denied');
    }
    // Token validation:
    const token = req.headers[externalAuthTokenName.toLowerCase()] as string;
    if (!token || token !== externalAuthToken) {
      logger.notice('External token verification error');
      throw new UnAuthorizedError('Access denied');
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
