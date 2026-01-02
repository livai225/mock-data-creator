import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  initiatePayment,
  checkPaymentStatus,
  checkCompanyPayment,
  paymentWebhook,
  getPaymentHistory,
  simulatePayment,
  submitPaymentProof,
  getAllPayments,
  verifyPayment,
  getCompanyPaymentStatus,
  submitManualPayment,
  validateManualPayment,
  rejectManualPayment,
  getPendingPayments,
  uploadPaymentProof
} from '../controllers/payment.controller.js';

const router = express.Router();

// Validation pour initier un paiement
const initiatePaymentValidation = [
  body('company_id').isInt().withMessage('company_id doit être un entier'),
  body('amount').isFloat({ min: 0 }).withMessage('amount doit être un nombre positif'),
  body('payment_method').optional().isIn(['mobile_money', 'card', 'bank_transfer']).withMessage('Méthode de paiement invalide')
];

// Routes protégées
router.post('/initiate', protect, initiatePaymentValidation, validate, initiatePayment);
router.post('/:id/simulate', protect, simulatePayment); // Mode TEST uniquement
router.get('/:id/status', protect, checkPaymentStatus);
router.get('/company/:companyId/check', protect, checkCompanyPayment);
router.get('/history', protect, getPaymentHistory);

// Webhook public (avec vérification de signature à ajouter)
router.post('/webhook', paymentWebhook);

// Routes pour le système de paiement manuel
router.post('/submit-proof', protect, upload.single('proofImage'), submitPaymentProof);
router.post('/submit-manual', protect, uploadPaymentProof, submitManualPayment);
router.get('/company/:companyId/status', protect, getCompanyPaymentStatus);

// Routes admin
router.get('/admin/all', protect, adminOnly, getAllPayments);
router.get('/admin/pending', protect, adminOnly, getPendingPayments);
router.put('/admin/:id/verify', protect, adminOnly, verifyPayment);
router.put('/:id/validate', protect, adminOnly, validateManualPayment);
router.put('/:id/reject', protect, adminOnly, rejectManualPayment);

export default router;
