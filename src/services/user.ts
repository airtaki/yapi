import { ObjectId } from "mongodb";
import UserModel from "../models/user";
import { PublicUser, User, UserInput, UserStatus } from "../types/user";
import { InternalError, NotFoundError } from "../utils/error";
import { hashPassword } from "../utils/hash";
import logger from "../utils/logger";
import { toPublicUser } from "../utils/user";

export const create = async (
  userInput: UserInput & { status: UserStatus }
): Promise<PublicUser> => {
  try {
    const password = await hashPassword(userInput.password);
    const newUser = new UserModel({
      ...userInput,
      password,
    });
    await newUser.save();
    const userWithoutPassword = toPublicUser(newUser.toObject());
    logger.info(`User has been created.`, userWithoutPassword);
    return userWithoutPassword;
  } catch (error) {
    logger.error(`Error creating user.`, { error, userInput });
    throw new InternalError("Error creating user");
  }
};

export const update = async (
  userId: string,
  delta: Partial<User>
): Promise<PublicUser> => {
  try {
    const hashedPassword = delta.password
      ? await hashPassword(delta.password)
      : undefined;
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        ...delta,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
      { new: true }
    ).lean();
    if (!updatedUser) {
      throw new NotFoundError(`User not found with id: ${userId}`);
    }
    const user = toPublicUser(updatedUser.toObject());
    logger.info(`User has been updated.`, user);
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { userId });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error updating user.`, {
      error,
      userId,
      delta,
    });
    throw new InternalError("Error updating user");
  }
};

export const get = async (userId: string): Promise<PublicUser> => {
  try {
    const user = await UserModel.findOne({ _id: new ObjectId(userId) }).lean();
    if (!user) {
      throw new NotFoundError(`User not found with id: ${userId}`);
    }
    return toPublicUser(user.toObject());
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { userId });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error fetching user.`, { error, userId });
    throw new InternalError("Error fetching user");
  }
};

export const getByEmail = async (
  email: string
): Promise<PublicUser> => {
  try {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundError(`User not found with email: ${email}`);
    }
    return toPublicUser(user.toObject());
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { email });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error fetching user by email.`, { error, email });
    throw new InternalError("Error fetching user by email");
  }
};

export const archive = async (userId: string): Promise<boolean> => {
  try {
    const user = await UserModel.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new NotFoundError(`User not found with id: ${userId}`);
    }
    const date = new Date();
    user.status = UserStatus.ARCHIVED;
    user.email = `${user.email}.ARCHIVED.${date.getTime()}`;
    await user.save();
    const archivedUser = toPublicUser(user.toObject());
    logger.info(`User has been archived.`, { archivedUser });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { userId });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error archiving user.`, { error, userId });
    throw new InternalError("Error archiving user");
  }
};

export const setStatus = async (
  userId: string,
  status: UserStatus
): Promise<boolean> => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { status },
      { new: true }
    ).lean();
    if (!user) {
      throw new NotFoundError(`User not found with id: ${userId}`);
    }
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn(`User not found.`, { userId });
      throw new NotFoundError("User not found");
    }
    logger.error(`Error setting user status.`, { error, userId, status });
    throw new InternalError("Error setting user status");
  }
};
