import express from 'express';
import {
  getPublicBanner,
  getPublicPricing,
  getPublicServicesContent,
  getPublicFiscaliteContent,
} from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/banner', getPublicBanner);
router.get('/pricing', getPublicPricing);
router.get('/services-content', getPublicServicesContent);
router.get('/fiscalite-content', getPublicFiscaliteContent);

export default router;
