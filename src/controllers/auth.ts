import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth";
import { TokenPurpose } from "../types";

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.getValidArguments<string>("email");
    const password = req.getValidArguments<string>("password");
    const token = await authService.signIn({ email, password }, req.getIp());
    res.success(200, "User has been authenticated.", { token });
  } catch (error) {
    return next(error);
  }
};

export const signOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.success(200, "User has been signed out.");
  } catch (error) {
    return next(error);
  }
};

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.getValidArguments<string>("email");
    const password = req.getValidArguments<string>("password");
    const result = await authService.signUp({ email, password }, req.getIp());
    res.success(200, "User has been signed up.", { result });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.success(200, "Hey, it's me!", req.user);
  } catch (error) {
    return next(error);
  }
};

export const verifySignUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.getValidArguments<string>("token");
    const result = await authService.verifySignUp(token, req.getIp());
    res.success(200, "User has been verified.", { result });
  } catch (error) {
    return next(error);
  }
};

export const isValidToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.getValidArguments<string>("userId");
    const token = req.getValidArguments<string>("token");
    const purpose = req.getValidArguments<TokenPurpose>("purpose");
    const result = await authService.isValidToken(userId, token, purpose, req.getIp());
    res.success(200, "Token is valid.", { result });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.getValidArguments<string>("email");
    const result = await authService.forgotPassword(email, req.getIp());
    res.success(200, "Password reset link has been sent.", { result });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.getValidArguments<string>("token");
    const password = req.getValidArguments<string>("password");
    const result = await authService.resetPassword(token, password, req.getIp());
    res.success(200, "Password has been reset.", { result });
  } catch (error) {
    return next(error);
  }
};

