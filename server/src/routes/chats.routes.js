import { Router } from 'express';
import * as chats from '../controllers/chats.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(authenticate));
router.get('/', asyncHandler(chats.listChats));
router.post('/', asyncHandler(chats.createOrGetChat));
router.get('/:chatId', asyncHandler(chats.getChat));
router.post('/:chatId/block', asyncHandler(chats.blockChat));
router.post('/:chatId/report', asyncHandler(chats.reportUserInChat));
router.post('/:chatId/messages', asyncHandler(chats.sendMessage));
router.post('/:chatId/pin', asyncHandler(chats.setChatPinned));

export default router;
