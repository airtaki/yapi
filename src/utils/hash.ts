import { createHash } from "crypto";
import argon2 from "argon2";

export const generateHash = (data: string): string => {
  const date = new Date();
  const randomString = Math.random().toString(36).substring(2, 15);
  const stringToHash = `${data}${date.getTime()}${randomString}`;
  return createHash("sha256").update(stringToHash).digest("hex");
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return await argon2.hash(plainPassword);
};

export const compare = async (
  plainText: string,
  hash: string
): Promise<boolean> => {
  return await argon2.verify(hash, plainText);
};
