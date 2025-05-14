import { randomBytes } from "crypto";
import VerificationTokenModel from "../models/verificationToken";
import { TokenPurpose } from "../types";
import { NotFoundError } from "../utils/error";

export const generateVerificationToken = async (
  userId: string,
  purpose: TokenPurpose,
  expiresIn: number = 60 * 60 * 24
): Promise<string> => {
  const token = randomBytes(32).toString("hex");

  await VerificationTokenModel.findOneAndUpdate(
    { userId, purpose },
    {
      token,
      expiresAt: new Date(Date.now() + 1000 * expiresIn),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return token;
};

export const verifyToken = async (
  token: string,
  purpose: TokenPurpose
): Promise<string> => {
  const record = await VerificationTokenModel.findOne({ token, purpose });
  if (!record || record.expiresAt < new Date()) {
    throw new NotFoundError("Invalid or expired token.");
  }
  return record.userId.toString();
};

export const deleteToken = async (
  userId: string,
  purpose: TokenPurpose
): Promise<boolean> => {
  const result = await VerificationTokenModel.deleteOne({
    userId,
    purpose,
  });
  return result?.deletedCount > 0;
};
