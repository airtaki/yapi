import express from 'express';
import * as controller from '../controllers/auth';
import * as validators from '../validators/auth';
import { validationHandler } from '../middlewares/validationHandler';
import { userAuth } from '../middlewares/auth';

export const router = express.Router();

router.post('/sign-in', validators.signIn, validationHandler, controller.signIn);
router.post('/sign-up', validators.signUp, validationHandler, controller.signUp);
router.post('/sign-out', userAuth, controller.signOut);
router.get('/me', userAuth, controller.me);
// TODO: internal use only!
router.get('/get-token-by-id/:id', validators.objectId, validationHandler, controller.getTokenById);

