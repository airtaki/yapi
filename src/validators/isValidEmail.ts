import { body } from "express-validator";

export default () => {
  return body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    .isLength({ min: 5, max: 128 })
    .withMessage("Email must be between 5 and 128 characters long")
    .bail()
    .custom((email: string, { req }) => {
      req.setValidArguments("email", email);
      return true;
    });
};
