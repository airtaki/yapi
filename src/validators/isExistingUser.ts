import UserModel from "../models/user";
import { ConflictError } from "../utils/error";
import isValidEmail from "./isValidEmail";

export default () => {
  return isValidEmail()
    .bail()
    .custom(async (email: string, { req }) => {
      const user = await UserModel.findOne({ email }).lean();
      if (user) {
        throw new ConflictError(`User already exists`);
      }
      req.setValidArguments("email", email);
      return true;
    });
};
