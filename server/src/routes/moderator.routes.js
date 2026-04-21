import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as mod from '../controllers/moderator.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate), authorize('moderator'));
router.get('/content', asyncHandler(mod.listContent));
router.get('/reports', asyncHandler(mod.listReports));
router.get('/verifications', asyncHandler(mod.listVerifications));

export default router;
