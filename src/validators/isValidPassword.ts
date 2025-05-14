import { body } from "express-validator";
import { getConfig, parseBoolean, parseNumber } from "../utils/config";
import { ValidationError } from "../utils/error";

const passwordMinLength = getConfig<number>(
  "auth.password.minLength",
  parseNumber
);
const passwordMaxLength = getConfig<number>(
  "auth.password.maxLength",
  parseNumber
);
const requireUppercase = getConfig<boolean>(
  "auth.password.requireUppercase",
  parseBoolean
);
const requireLowercase = getConfig<boolean>(
  "auth.password.requireLowercase",
  parseBoolean
);
const requireSpecial = getConfig<boolean>(
  "auth.password.requireSpecial",
  parseBoolean
);
const requireNumber = getConfig<boolean>(
  "auth.password.requireNumber",
  parseBoolean
);

export default (checkRequirements: boolean = false) => {
  return body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: passwordMinLength, max: passwordMaxLength })
    .withMessage(
      `Password must be at least ${passwordMinLength} characters long`
    )
    .bail()
    .custom((value: string, { req }) => {
      if (!checkRequirements) {
        req.setValidArguments("password", value);
        return true;
      }
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
    });
};
