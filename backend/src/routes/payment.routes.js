import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  initiatePayment,
  checkPaymentStatus,
  checkCompanyPayment,
  paymentWebhook,
  getPaymentHistory,
  simulatePayment
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

export default router;
