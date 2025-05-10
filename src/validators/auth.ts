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
    .bail()
    .isMongoId()
    .withMessage("Invalid ID format")
    .bail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments("id", value);
      return true;
    }),
];

export const signUp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    .isLength({ min: 5, max: 128 })
    .withMessage("Email must be between 5 and 128 characters long")
    .bail()
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
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: passwordMinLength, max: passwordMaxLength })
    .withMessage(
      `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long.`
    )
    .bail()
    .custom((value: string, { req }) => {
      const rules = [
        {
          required: requireUppercase,
          test: /[A-Z]/,
          label: "an uppercase letter",
        },
        {
          required: requireLowercase,
          test: /[a-z]/,
          label: "a lowercase letter",
        },
        {
          required: requireSpecial,
          test: /[^a-zA-Z0-9]/,
          label: "a special character",
        },
        { required: requireNumber, test: /\d/, label: "a number" },
      ] as const;

      const failed = rules.filter(
        (rule) => rule.required && !rule.test.test(value)
      );

      if (failed.length > 0) {
        const parts = rules.map((rule) => rule.label);
        const last = parts.pop();
        const message = `Password must contain ${parts.join(", ")}${
          parts.length > 0 ? " and " : ""
        }${last}.`;
        throw new ValidationError(
          message,
          failed.map(() => true)
        );
      }
      req.setValidArguments("password", value);
      return true;
    }),
];

export const signIn = [
  body("email")
    .notEmpty()
    .bail()
    .isEmail()
    .bail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments("email", value);
      return true;
    }),

  body("password")
    .notEmpty()
    .bail()
    .isString()
    .bail()
    .isLength({ min: passwordMinLength, max: passwordMaxLength })
    .bail()
    .custom((value: string, { req }) => {
      req.setValidArguments("password", value);
      return true;
    }),
];
