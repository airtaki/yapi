import { param } from "express-validator";

export default (name: string) => {
  return param("token")
    .notEmpty()
    .withMessage("Token is required")
    .bail()
    .isString()
    .withMessage("Token must be a string")
    .bail()
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid token")
    .bail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments(name, value);
      return true;
    });
};
