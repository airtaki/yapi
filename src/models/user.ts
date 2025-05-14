import mongoose, { Schema, Document } from 'mongoose';
import { User, UserStatus, Gender } from '../types/user';

type UserDocument = User & Document;

const userSchema: Schema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(UserStatus), default: UserStatus.PENDING },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  nickname: { type: String },
  birthdate: { type: Date },
  userProfile: {
    height: { type: Number },
    weight: { type: Number },
    gender: { type: String, enum: Object.values(Gender) },
    bio: { type: String }
  },
  userProperties: { type: Object }
}, {
  timestamps: true
});

export default mongoose.model<UserDocument>('User', userSchema);
