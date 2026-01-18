import express from 'express';
import { protect } from '../middleware/auth.js';
import { documentLimiter } from '../middleware/rateLimiter.js';
import {
  generateDocuments,
  generateDocumentManual,
  previewDocuments,
  getTemplates,
  getMyDocuments,
  downloadDocument,
  viewDocument,
  deleteCompanyDocuments,
  regenerateDocument
} from '../controllers/document.controller.js';

const router = express.Router();

// Route publique pour obtenir les templates
router.get('/templates', getTemplates);

// Route publique pour prévisualiser les documents (sans authentification)
router.post('/preview', documentLimiter, previewDocuments);

// Toutes les autres routes nécessitent une authentification
router.use(protect);

router.post('/generate', documentLimiter, generateDocuments);
router.post('/generate-manual', documentLimiter, generateDocumentManual);
router.post('/regenerate/:id', documentLimiter, regenerateDocument);
router.get('/my', getMyDocuments);
router.delete('/company/:companyId', deleteCompanyDocuments);
router.get('/:id/view', viewDocument);
router.get('/:id/download', downloadDocument);

export default router;
