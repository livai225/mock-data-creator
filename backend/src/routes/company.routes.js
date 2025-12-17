import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { documentLimiter } from '../middleware/rateLimiter.js';
import {
  createCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
  submitCompany,
  deleteCompany,
  getMyStats
} from '../controllers/company.controller.js';

const router = express.Router();

// Validation pour la création d'entreprise
const createCompanyValidation = [
  body('companyType')
    .isIn(['SARL', 'SARLU', 'SARL_PLURI', 'EI', 'SNC', 'SCS', 'GIE', 'SA', 'SAS', 'COOPERATIVE'])
    .withMessage('Type d\'entreprise invalide'),
  body('companyName').trim().notEmpty().withMessage('Le nom de l\'entreprise est requis'),
  body('activity').trim().notEmpty().withMessage('L\'activité est requise'),
  body('capital').isNumeric().withMessage('Le capital doit être un nombre'),
  body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('city').optional().trim(),
  body('gerant').optional().trim(),
  body('associates').optional().isArray().withMessage('Les associés doivent être un tableau'),
  body('managers').optional().isArray().withMessage('Les gérants doivent être un tableau'),
  body('chiffreAffairesPrev').optional().trim(),
  body('paymentAmount').isNumeric().withMessage('Le montant du paiement doit être un nombre')
];

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes
router.post('/', documentLimiter, createCompanyValidation, validate, createCompany);
router.get('/', getMyCompanies);
router.get('/stats/me', getMyStats);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.post('/:id/submit', submitCompany);
router.delete('/:id', deleteCompany);

export default router;
