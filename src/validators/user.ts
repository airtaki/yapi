import { body, check } from "express-validator";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import UserModel from "../models/user";
import { UserStatus } from "../types/user";
import { getConfig } from "../utils/config";
import { NotFoundError, ValidationError } from "../utils/error";

const passwordMinLength = getConfig<number>("auth.password.minLength");
const passwordMaxLength = getConfig<number>("auth.password.maxLength");
const requireUppercase = getConfig<boolean>("auth.password.requireUppercase");
const requireLowercase = getConfig<boolean>("auth.password.requireLowercase");
const requireSpecial = getConfig<boolean>("auth.password.requireSpecial");
const requireNumber = getConfig<boolean>("auth.password.requireNumber");

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
      req.setValidArguments("user", user);
      return true;
    }),
];

export const validateUserData = [
  body("email")
    .notEmpty()
    .isEmail()
    .custom(async (value: string) => {
      const user = await UserModel.findOne({ email: value }).lean();
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .isString()
    .isLength({ min: passwordMinLength, max: passwordMaxLength })
    .withMessage(
      `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long.`
    )
    .custom((value: string) => {
      const checks = [
        requireUppercase && !/[A-Z]/.test(value)
          ? "Password must contain at least one uppercase letter."
          : null,
        requireLowercase && !/[a-z]/.test(value)
          ? "Password must contain at least one lowercase letter."
          : null,
        requireSpecial && !/[^a-zA-Z0-9]/.test(value)
          ? "Password must contain at least one special character."
          : null,
        requireNumber && !/\d/.test(value)
          ? "Password must contain at least one number."
          : null,
      ];
      const errors = checks.filter((msg): msg is string => Boolean(msg));
      if (errors.length > 0) {
        throw new ValidationError("Validation Error", errors);
      }
      return true;
    }),

  body("status")
    .notEmpty()
    .isString()
    .isIn(Object.values(UserStatus))
    .withMessage(
      `Status must be one of: ${Object.values(UserStatus).join(", ")}.`
    ),

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
