import express from 'express';
import * as controller from '../controllers/user';
import { validationHandler } from '../middlewares/validationHandler';

export const router = express.Router();

// router.get('/:skip?/:limit?/:isLive?', internalAuth, validators.list, validationHandler, controller.list);
// router.post('/', internalAuth, validators.create, validationHandler, controller.create);
// router.patch('/:id', internalAuth, validators.update, validationHandler, controller.update);
// router.delete('/:id', internalAuth, validators.remove, validationHandler, controller.remove);

