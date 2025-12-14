import express from 'express';
import { getPublicBanner, getPublicPricing } from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/banner', getPublicBanner);
router.get('/pricing', getPublicPricing);

export default router;
