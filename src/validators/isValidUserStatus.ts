import { body } from "express-validator";
import { UserStatus } from "../types/user";

export default () => {
  return body("userStatus")
    .notEmpty()
    .withMessage("User status is required")
    .bail()
    .isString()
    .withMessage("User status must be a string")
    .bail()
    .isIn(Object.values(UserStatus))
    .withMessage(
      `User status must be one of: ${Object.values(UserStatus).join(", ")}.`
    )
    .bail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments("userStatus", value);
      return true;
    });
};
