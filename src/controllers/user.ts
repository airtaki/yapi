import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user";
import { UserStatus } from "../types/user";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email: string = req.getValidArguments("email");
    const password: string = req.getValidArguments("password");
    const status: UserStatus = req.getValidArguments("status");
    const user = await userService.create({ email, password, status });
    res.success(200, "User has been created.", user);
  } catch (error) {
    return next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const userData = req.getValidArguments("userData");
    const user = await userService.update(userId, userData);
    res.success(200, "User has been updated.", user);
  } catch (error) {
    return next(error);
  }
};

export const get = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const user = await userService.get(userId);
    res.success(200, "User has been fetched.", user);
  } catch (error) {
    return next(error);
  }
};

export const archive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const result = await userService.archive(userId);
    res.success(200, "User has been archived.", { result });
  } catch (error) {
    return next(error);
  }
};
