import express from 'express';
import { protect } from '../middleware/auth.js';
import { documentLimiter } from '../middleware/rateLimiter.js';
import {
  generateDocuments,
  generateDocumentManual,
  getTemplates,
  getMyDocuments,
  downloadDocument,
  viewDocument
} from '../controllers/document.controller.js';

const router = express.Router();

// Route publique pour obtenir les templates
router.get('/templates', getTemplates);

// Toutes les autres routes nécessitent une authentification
router.use(protect);

router.post('/generate', documentLimiter, generateDocuments);
router.post('/generate-manual', documentLimiter, generateDocumentManual);
router.get('/my', getMyDocuments);
router.get('/:id/view', viewDocument);
router.get('/:id/download', downloadDocument);

export default router;
