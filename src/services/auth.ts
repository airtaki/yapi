import { ObjectId } from "mongodb";
import UserModel from "../models/user";
import { TokenPurpose } from "../types";
import { PublicUser, UserStatus } from "../types/user";
import { getConfig, parseBoolean } from "../utils/config";
import { InternalError, NotFoundError, UnAuthorizedError } from "../utils/error";
import { compare, hashPassword } from "../utils/hash";
import { generateJwt } from "../utils/jwt";
import logger from "../utils/logger";
import { toPublicUser } from "../utils/user";
import { sendEmail } from "./email";
import { deleteToken, generateVerificationToken, verifyToken } from "./token";

export const signIn = async ({ email, password }: { email: string; password: string }, ip: string): Promise<string> => {
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
    logger.info(`User successfully signed in.`, { email, ip });
    return generateJwt(publicUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.notice(`User not found.`, { email, ip });
      throw new NotFoundError("User not found");
    }
    if (error instanceof UnAuthorizedError) {
      logger.warning(`Invalid credentials.`, { email, ip });
      throw new UnAuthorizedError("Invalid credentials");
    }
    logger.error(`Error validating user.`, { error, email, ip });
    throw new NotFoundError("User not found");
  }
};

export const signUp = async (
  { email, password }: { email: string; password: string },
  ip: string
): Promise<PublicUser | string> => {
  try {
    const requireEmailVerification = getConfig<boolean>("auth.verification.requireForSignUp", parseBoolean);
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
    logger.info(`User has been successfully signed up.`, { user, ip });
    if (requireEmailVerification) {
      const verificationToken = await generateVerificationToken(user._id, TokenPurpose.EMAIL_VERIFICATION, ip);
      const verificationLink = `${getConfig<string>("baseUrl")}/auth/verify/${verificationToken}`;
      await sendEmail({
        to: email,
        subject: "Email Verification",
        text: `Your email verification code is ${verificationToken}.`,
      });
      logger.info(`Email verification sent.`, { email, ip, verificationToken });
      // Return user object without token
      return user;
    }
    return generateJwt(user);
  } catch (error) {
    logger.error(`Error creating user.`, { error, email, ip });
    throw new InternalError("Error during sign up");
  }
};

export const verifySignUp = async (token: string, ip: string): Promise<string> => {
  try {
    const userId = await verifyToken(token, TokenPurpose.EMAIL_VERIFICATION);
    const user = await UserModel.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new NotFoundError(`User not found.`);
    }
    if (user.status !== UserStatus.PENDING) {
      throw new UnAuthorizedError(`User status should be PENDING.`);
    }
    user.status = UserStatus.ACTIVE;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();
    await deleteToken(user._id, TokenPurpose.EMAIL_VERIFICATION);
    const publicUser: PublicUser = toPublicUser(user.toObject());
    logger.info(`User successfully verified.`, { user: publicUser });
    return generateJwt(publicUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.notice(error.message, { ...error.details });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    if (error instanceof UnAuthorizedError) {
      logger.warning(error.message, { ...error.details });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    logger.error(`Error verifying user.`, { error, token });
    throw new InternalError("Error verifying user");
  }
};

export const isValidToken = async (
  expectedUserId: string,
  token: string,
  purpose: TokenPurpose,
  ip: string
): Promise<boolean> => {
  try {
    const userId = await verifyToken(token, purpose);
    if (!userId) {
      throw new NotFoundError(`Token not found.`);
    }
    if (userId !== expectedUserId) {
      throw new UnAuthorizedError(`Token does not match user.`);
    }
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.notice(error.message, { ...error.details, token, ip });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    if (error instanceof UnAuthorizedError) {
      logger.warning(error.message, { ...error.details, token, ip });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    logger.error(`Error verifying token.`, { error, token, ip });
    throw new InternalError("Error verifying token");
  }
};

export const forgotPassword = async (email: string, ip: string): Promise<boolean> => {
  try {
    const user = await UserModel.findOne({ email, status: UserStatus.ACTIVE });
    if (!user) {
      throw new NotFoundError(`User not found with email: ${email}`);
    }
    const verificationToken = await generateVerificationToken(user._id, TokenPurpose.PASSWORD_RESET, ip);
    const verificationLink = `${getConfig<string>("baseUrl")}/auth/reset-password/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: `Your password reset code is ${verificationToken}.`,
    });
    logger.info(`Password reset email sent.`, { email, ip, verificationToken });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      // In this case we don't throw an error, just log the event and return true.
      logger.notice(`User not found for reset password.`, { email, ip });
      return true;
    }
    logger.error(`Error sending password reset email.`, { error, email, ip });
    throw new InternalError("Error sending password reset email");
  }
};

export const resetPassword = async (token: string, password: string, ip: string): Promise<boolean> => {
  try {
    const userId = await verifyToken(token, TokenPurpose.PASSWORD_RESET);
    const user = await UserModel.findOne({ _id: new ObjectId(userId), status: UserStatus.ACTIVE });
    if (!user) {
      throw new NotFoundError(`User not found.`);
    }
    user.password = await hashPassword(password);
    await user.save();
    await deleteToken(user._id, TokenPurpose.PASSWORD_RESET);
    await sendEmail({
      to: user.email,
      subject: "Your password has been reset",
      text: `Your password has been successfully reset. If you did not request this change, please contact us immediately.`,
    });
    logger.info(`User password has been reset.`, { userId, ip });
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.notice(error.message, { ...error.details, token, ip });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    if (error instanceof UnAuthorizedError) {
      logger.warning(error.message, { ...error.details, token, ip });
      throw new UnAuthorizedError("Invalid or expired token.");
    }
    logger.error(`Error resetting password.`, { error, token, ip });
    throw new InternalError("Error resetting password");
  }
};
