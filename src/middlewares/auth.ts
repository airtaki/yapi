import { Request, Response, NextFunction } from 'express';
import { UnAuthorizedError } from '../utils/error';
import { getConfig } from "../utils/config";
import { verifyToken } from '../utils/jwt';
import { PublicUser, User } from '../types/user';

const internalAuthToken = getConfig<string>('auth.internal.token');
const externalAuthToken = getConfig<string>('auth.external.token');

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next(new UnAuthorizedError('No token provided'));
  }
  try {
    const user = verifyToken(token) as PublicUser;
    req.user = user;
  } catch (error) {
    return next(new UnAuthorizedError('Invalid token'));
  }
  return next();
};

export const internalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Remove Bearer from the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token !== internalAuthToken) {
      throw new UnAuthorizedError('Auth token is invalid');
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export const externalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return next();
  } catch (error) {
    return next(error);
  }
};
