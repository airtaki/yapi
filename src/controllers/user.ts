import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user";
import { User, UserStatus } from "../types/user";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.getValidArguments<string>("email");
    const password = req.getValidArguments<string>("password");
    const status = req.getValidArguments<UserStatus>("status");
    const user = await userService.create({ email, password, status });
    res.success(200, "User has been created.", user);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.getValidArguments<string>("userId");
    const delta = req.getValidArguments<Partial<User>>("delta");
    const user = await userService.update(userId, delta);
    res.success(200, "User has been updated.", user);
  } catch (error) {
    return next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await userService.get(userId);
    res.success(200, "User has been fetched.", user);
  } catch (error) {
    return next(error);
  }
};

export const archive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await userService.archive(userId);
    res.success(200, "User has been archived.", { result });
  } catch (error) {
    return next(error);
  }
};
