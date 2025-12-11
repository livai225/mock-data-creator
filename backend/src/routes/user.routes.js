import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes utilisateur (à implémenter selon les besoins)
router.get('/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
