import { ObjectId } from "mongoose";
import { Document, TokenPurpose } from ".";

export type VerificationToken = Document & {
  userId: ObjectId;
  token: string;
  purpose: TokenPurpose;
  expiresAt: Date;
};

