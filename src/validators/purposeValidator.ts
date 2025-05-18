import { body } from "express-validator";
import { TokenPurpose } from "../types";

export default () => {
  return body("purpose")
    .notEmpty()
    .withMessage("Purpose is required")
    .bail()
    .isString()
    .withMessage("Purpose must be a string")
    .bail()
    .isLength({ min: 6, max: 64 })
    .withMessage("Invalid purpose")
    .bail()
    .isIn(Object.values(TokenPurpose))
    .withMessage("Invalid purpose")
    .custom(async (value: string, { req }) => {
      req.setValidArguments("purpose", value);
      return true;
    });
};
