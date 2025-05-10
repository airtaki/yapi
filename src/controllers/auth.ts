import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth";

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.getValidArguments("email");
    const password = req.getValidArguments("password");
    const token = await authService.signIn({ email, password }, req.getIp());
    res.success(200, "User has been authenticated.", { token });
  } catch (error) {
    return next(error);
  }
};

export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.success(200, "User has been signed out.");
  } catch (error) {
    return next(error);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.getValidArguments("email");
    const password = req.getValidArguments("password");
    const token = await authService.signUp({ email, password }, req.getIp());
    res.success(200, "User has been signed up.", { token });
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

export const getTokenById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.getValidArguments("id");
    const token = await authService.getTokenById(id);
    res.success(200, "Token has been fetched.", { token });
  } catch (error) {
    return next(error);
  }
};
