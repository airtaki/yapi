import express from "express";
import * as controller from "../controllers/auth";
import { userAuth, externalAuth } from "../middlewares/auth";
import { validationHandler } from "../middlewares/validationHandler";
import isExistingUser from "../validators/isExistingUser";
import isValidEmail from "../validators/isValidEmail";
import isValidPassword from "../validators/isValidPassword";
import isValidVerificationToken from "../validators/isValidVerificationToken";

const signInValidator = [isValidEmail(), isValidPassword()];
const signUpValidator = [isExistingUser(), isValidPassword(true)];
const tokenValidator = [isValidVerificationToken("token")];

export const router = express.Router();

router.post("/sign-in", signInValidator, validationHandler, controller.signIn);
router.post("/sign-up", signUpValidator, validationHandler, controller.signUp);
router.post("/verify-sign-up/:token", tokenValidator, validationHandler, controller.verifySignUp);
router.post("/sign-out", userAuth, controller.signOut);
router.get("/me", userAuth, controller.me);
