import VerificationTokenModel from "../models/verificationToken";
import { TokenPurpose } from "../types";
import { getConfig, parseNumber } from "../utils/config";
import { NotFoundError } from "../utils/error";

const tokenExpiresIn = getConfig<number>("auth.verification.token.expiresIn", parseNumber);
const tokenBlocks = getConfig<number>("auth.verification.token.blocks", parseNumber);
const tokenBlockLength = getConfig<number>("auth.verification.token.blockLength", parseNumber);

export const generateVerificationToken = async (
  userId: string,
  purpose: TokenPurpose,
  ip: string,
  expiresIn: number = tokenExpiresIn
): Promise<string> => {
  const token = generateCodeBlock(tokenBlocks, tokenBlockLength);

  await VerificationTokenModel.findOneAndUpdate(
    { userId, purpose },
    {
      token,
      ip,
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

export const verifyToken = async (token: string, purpose: TokenPurpose): Promise<string> => {
  const record = await VerificationTokenModel.findOne({ token, purpose });
  if (!record || record.expiresAt < new Date()) {
    throw new NotFoundError("Invalid or expired token.", { token, purpose });
  }
  return record.userId.toString();
};

export const deleteToken = async (userId: string, purpose: TokenPurpose): Promise<boolean> => {
  const result = await VerificationTokenModel.deleteOne({
    userId,
    purpose,
  });
  return result?.deletedCount > 0;
};

const generateCodeBlock = (blocks = 2, blockLength = 4): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomBlock = () =>
    Array.from({ length: blockLength }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  return Array.from({ length: blocks }, randomBlock).join("-");
};
