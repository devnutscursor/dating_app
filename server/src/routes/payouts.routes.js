import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as payouts from '../controllers/payouts.controller.js';

const router = Router();

router.use(asyncHandler(authenticate));
router.post('/request', asyncHandler(payouts.requestPayout));
router.get('/mine', asyncHandler(payouts.listMyPayouts));

export default router;
