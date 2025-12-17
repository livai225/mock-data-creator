import express from 'express';
import { protect } from '../middleware/auth.js';
import { documentLimiter } from '../middleware/rateLimiter.js';
import {
  generateDocuments,
  getMyDocuments,
  downloadDocument,
  viewDocument
} from '../controllers/document.controller.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

router.post('/generate', documentLimiter, generateDocuments);
router.get('/my', getMyDocuments);
router.get('/:id/view', viewDocument);
router.get('/:id/download', downloadDocument);

export default router;
