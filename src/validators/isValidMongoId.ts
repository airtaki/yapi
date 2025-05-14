import { param } from "express-validator";

export default (name: string) => {
  return param("id")
    .notEmpty()
    .withMessage("ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid ID format")
    .bail()
    .custom(async (value: string, { req }) => {
      req.setValidArguments(name, value);
      return true;
    });
};
