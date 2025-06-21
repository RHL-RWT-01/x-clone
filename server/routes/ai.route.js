import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { chatbot } from '../controllers/ai.controller.js';
const router = express.Router();


router.post('/chat',protectRoute , chatbot);

export default router;