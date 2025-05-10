import { Document } from ".";

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
  ARCHIVED = "ARCHIVED",
};

export type UserInput = {
  email: string;
  password: string;
  userProperties?: Record<
    string,
    boolean | string | number | string[] | number[]
  >;
};

export type User = UserInput & Document & {
  status: UserStatus;
  lastLoginAt?: Date;
  lastLoginIp?: string;
};

export type PublicUser = Omit<User, "password" | "userProperties">;
