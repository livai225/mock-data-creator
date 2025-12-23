import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getMyPayments,
  getPaymentStats,
  createPayment,
  updatePaymentStatus,
  downloadReceipt,
  getAllPayments
} from '../controllers/payment.controller.js';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.get('/my', protect, getMyPayments);
router.get('/stats', protect, getPaymentStats);
router.post('/', protect, createPayment);
router.get('/:id/receipt', protect, downloadReceipt);

// Routes admin
router.get('/', protect, adminOnly, getAllPayments);
router.put('/:id/status', protect, updatePaymentStatus);

export default router;

