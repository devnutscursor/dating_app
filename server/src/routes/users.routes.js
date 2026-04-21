import { Router } from 'express';
import * as users from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate));
router.get('/discover', asyncHandler(users.discover));
router.patch('/me', asyncHandler(users.updateMe));
router.get('/:id', asyncHandler(users.getUserById));

export default router;
