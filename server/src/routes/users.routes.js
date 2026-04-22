import { Router } from 'express';
import * as users from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate));
router.get('/discover', asyncHandler(users.discover));
router.get('/online', asyncHandler(users.listOnline));
router.get('/likes', asyncHandler(users.listLikes));
router.post('/likes', asyncHandler(users.createLike));
router.patch('/me', asyncHandler(users.updateMe));
router.get('/:id', asyncHandler(users.getUserById));

export default router;
