import express from 'express';
import * as controller from '../controllers/user';
import { validationHandler } from '../middlewares/validationHandler';

import isExistingUser from "../validators/isExistingUser";
import isValidEmail from "../validators/isValidEmail";
const userValidator = [isExistingUser(), isValidEmail()];

export const router = express.Router();

// router.get('/:skip?/:limit?/:isLive?', internalAuth, validators.list, validationHandler, controller.list);
// router.post('/', internalAuth, validators.create, validationHandler, controller.create);
router.patch('/:userId', userValidator, validationHandler, controller.update);
// router.delete('/:id', internalAuth, validators.remove, validationHandler, controller.remove);

