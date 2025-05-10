import { body, param } from "express-validator";
import UserModel from "../models/user";
import { getConfig } from "../utils/config";
import { ConflictError, ValidationError } from "../utils/error";

const passwordMinLength = getConfig<number>("auth.password.minLength");
const passwordMaxLength = getConfig<number>("auth.password.maxLength");
const requireUppercase = getConfig<boolean>("auth.password.requireUppercase");
const requireLowercase = getConfig<boolean>("auth.password.requireLowercase");
const requireSpecial = getConfig<boolean>("auth.password.requireSpecial");
const requireNumber = getConfig<boolean>("auth.password.requireNumber");

export const objectId = [
  param("id")
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom(async (value: string, { req }) => {
      req.setValidArguments("id", value);
      return true;
    }),
];

export const signUp = [
  body("email")
    .notEmpty()
    .isEmail()
    .custom(async (value: string, { req }) => {
      const user = await UserModel.findOne({ email: value }).lean();
      if (user) {
        throw new ConflictError("Email already exists");
      }
      req.setValidArguments("email", value);
      return true;
    }),

  body("password")
    .notEmpty()
    .isString()
    .isLength({ min: passwordMinLength, max: passwordMaxLength })
    .withMessage(
      `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long.`
    )
    .custom((value: string, { req }) => {
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
      req.setValidArguments("password", value);
      return true;
    }),
];

export const signIn = [
  body("email")
    .notEmpty()
    .isEmail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments("email", value);
      return true;
    }),

  body("password")
    .notEmpty()
    .isString()
    .custom((value: string, { req }) => {
      req.setValidArguments("password", value);
      return true;
    }),
];
