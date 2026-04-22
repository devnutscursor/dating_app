import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as activities from '../controllers/activities.controller.js';

const router = Router();
router.use(asyncHandler(authenticate));
router.get('/', asyncHandler(activities.listActivities));

export default router;
