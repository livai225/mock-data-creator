import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes documents (à implémenter avec la génération PDF)
router.get('/company/:companyId', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
