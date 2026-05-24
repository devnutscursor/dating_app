import { Router } from 'express';
import * as payments from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/packs', asyncHandler(payments.listPacks));
router.get('/transactions', asyncHandler(authenticate), asyncHandler(payments.listMyTransactions));
router.post('/create', asyncHandler(authenticate), asyncHandler(payments.createPayment));

export default router;
