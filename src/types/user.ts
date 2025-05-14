import { Document } from ".";

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
  ARCHIVED = "ARCHIVED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  TRANSGENDER = "TRANSGENDER",
  AGENDER = "AGENDER",
  INTERSEX = "INTERSEX",
  OTHER = "OTHER",
};

export type UserInput = {
  nickname?: string;
  email: string;
  password: string;
  birthdate?: Date;
  userProperties?: Record<
    string,
    boolean | string | number | string[] | number[]
  >;
};

export interface UserProfile {
  height?: number; // in cm
  weight?: number; // in kg
  gender?: Gender;
  bio?: string;
}

export type User = UserInput & Document & {
    status: UserStatus;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    userProfile?: UserProfile;
  };

export type PublicUser = Omit<User, "password" | "userProperties">;
