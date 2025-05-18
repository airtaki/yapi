import { check } from "express-validator";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import UserModel from "../models/user";
import { UserStatus } from "../types/user";
import { NotFoundError, ValidationError } from "../utils/error";

export default (status?: [UserStatus] | null) => {
  return check("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .isString()
    .withMessage("User ID must be a string")
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage("User ID must be 24 characters long")
    .bail()
    .isMongoId()
    .withMessage("User ID must be a valid identifier")
    .bail()
    .custom(async (value: string, { req }) => {
      if (!isValidObjectId(value)) {
        throw new ValidationError("Invalid user ID");
      }
      const user = await UserModel.findOne({ _id: new ObjectId(value) }).lean();
      if (!user) {
        throw new NotFoundError(`User not found with id: ${value}`);
      }
      if (status && !status.includes(user.status)) {
        throw new NotFoundError(`User not found with id: ${value}`);
      }
      req.setValidArguments("user", user);
      return true;
    });
};
