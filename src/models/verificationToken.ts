import { Schema, model } from "mongoose";
import { TokenPurpose } from "../types";
import { VerificationToken } from "../types/verificationToken";

const verificationTokenSchema: Schema = new Schema<VerificationToken>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  purpose: { type: String, required: true, enum: Object.values(TokenPurpose) },
  createdAt: { type: Date, default: new Date() },
  expiresAt: { type: Date, required: true },
});

export default model<VerificationToken>("VerificationToken", verificationTokenSchema);
