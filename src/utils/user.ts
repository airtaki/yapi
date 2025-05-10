import { User, PublicUser } from "../types/user";

export const toPublicUser = (user: User): PublicUser => {
  const { password, userProperties, ...rest } = user;
  return rest;
};
