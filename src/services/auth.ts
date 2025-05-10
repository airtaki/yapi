import UserModel from "../models/user";
import { PublicUser, User, UserInput, UserStatus } from "../types/user";
import { getConfig, parseBoolean } from "../utils/config";
import {
  InternalError,
  NotFoundError,
  UnAuthorizedError,
} from "../utils/error";
import { hashPassword, compare } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import logger from "../utils/logger";
import { ObjectId } from "mongodb";
import { toPublicUser } from "../utils/user";

export const signUp = async (
  { email, password }: { email: string; password: string },
  ip: string
): Promise<PublicUser | string> => {
  try {
    const requireEmailVerification = getConfig<boolean>(
      "auth.requireEmailVerification",
      parseBoolean
    );
    const newUser = new UserModel({
      email,
      password: await hashPassword(password),
    });
    if (requireEmailVerification) {
      newUser.status = UserStatus.PENDING;
    } else {
      newUser.status = UserStatus.ACTIVE;
      newUser.lastLoginAt = new Date();
      newUser.lastLoginIp = ip;
    }
    await newUser.save();
    const user = toPublicUser(newUser.toObject());
    logger.info(`User has been successfully signed up.`, user);
    return requireEmailVerification ? user : generateToken(user);
  } catch (error) {
    logger.error(`Error creating user.`, { error, email });
    throw new InternalError("Error during sign up");
  }
};

export const signIn = async (
  { email, password }: { email: string; password: string },
  ip: string
): Promise<string> => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundError(`User not found with email: ${email}`);
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnAuthorizedError(`User is not active: ${user.status}`);
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new UnAuthorizedError("Invalid password");
    }
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();
    const publicUser: PublicUser = toPublicUser(user.toObject());
    logger.info(`User successfully signed in: ${email}`);
    return generateToken(publicUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { email });
      throw new NotFoundError("User not found");
    }
    if (error instanceof UnAuthorizedError) {
      logger.warn(`Invalid credentials.`, { email });
      throw new UnAuthorizedError("Invalid credentials");
    }
    logger.error(`Error validating user.`, { error, email });
    throw new NotFoundError("User not found");
  }
};

export const getTokenById = async (userId: string): Promise<string> => {
  try {
    const user = await UserModel.findOne({ _id: new ObjectId(userId) }).lean();
    if (!user) {
      throw new NotFoundError(`User not found with id: ${userId}`);
    }
    return generateToken(toPublicUser(user));
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { userId });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error fetching user.`, { error, userId });
    throw new InternalError("Error fetching user");
  }
};
