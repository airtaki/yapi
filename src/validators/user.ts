import { body, check } from "express-validator";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import UserModel from "../models/user";
import { UserStatus, Gender } from "../types/user";
import { getConfig } from "../utils/config";
import { ConflictError, NotFoundError, UnAuthorizedError, ValidationError } from "../utils/error";

export const isValidUser = [
  check("userId")
    .notEmpty()
    .isString()
    .isMongoId()
    .custom(async (value: string, { req }) => {
      if (!isValidObjectId(value)) {
        throw new ValidationError("Invalid user ID");
      }
      const user = await UserModel.findOne({ _id: new ObjectId(value) }).lean();
      if (!user) {
        throw new NotFoundError(`User not found with id: ${value}`);
      }
      if (user.status !== UserStatus.ACTIVE) {
        throw new NotFoundError(
          `User not found with id: ${value}`
        );
      }
      req.setValidArguments("user", user);
      return true;
    }),
];

export const validateUserData = [

  body("status")
    .notEmpty()
    .isString()
    .isIn(Object.values(UserStatus))
    .withMessage(
      `Status must be one of: ${Object.values(UserStatus).join(", ")}.`
    ),

  body("userProfile")
    .optional()
    .isObject()
    .withMessage("User profile must be an object")
    .custom((value: Record<string, number | string | Gender>) => {
      // TODO: finish the validation
      return true;
    }),

  body("userProperties")
    .optional()
    .isObject()
    .withMessage("User properties must be an object")
    .custom((value: Record<string, unknown>) => {
      const keys = Object.keys(value);
      const invalidKeys = keys.filter((key) => {
        const type = typeof value[key];
        return (
          type !== "boolean" &&
          type !== "string" &&
          type !== "number" &&
          !Array.isArray(value[key]) &&
          !(
            Array.isArray(value[key]) &&
            value[key].every(
              (item) => typeof item === "string" || typeof item === "number"
            )
          )
        );
      });
      if (invalidKeys.length > 0) {
        throw new ValidationError(
          "Validation Error",
          invalidKeys.map((key) => `Invalid type for key: ${key}.`)
        );
      }
      return true;
    }),

  body("lastLoginIp")
    .optional()
    .isString()
    .isIP()
    .withMessage("Last login IP must be a valid IP address"),

  body("lastLoginAt")
    .optional()
    .isString()
    .isISO8601()
    .withMessage("Last login date must be a valid ISO 8601 date string"),
];
