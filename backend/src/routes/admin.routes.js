import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getDashboard,
  getAllUsers,
  getAllCompanies,
  getAllDocuments,
  updateCompanyStatus,
  toggleUserStatus,
  deleteUser,
  getDetailedStats,
  updateUserRole,
  getBannerSetting,
  updateBannerSetting,
  getPricingSetting,
  updatePricingSetting
} from '../controllers/admin.controller.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification admin
router.use(protect, adminOnly);

// Validation pour la mise à jour du statut
const statusValidation = [
  body('status')
    .isIn(['draft', 'pending', 'processing', 'completed', 'rejected'])
    .withMessage('Statut invalide'),
  body('adminNotes').optional().trim()
];

const roleValidation = [
  body('role').isIn(['user', 'admin']).withMessage('Rôle invalide')
];

const bannerValidation = [
  body('enabled').optional().isBoolean().withMessage('enabled doit être un booléen'),
  body('message').optional().isString().withMessage('message invalide'),
  body('variant').optional().isIn(['info', 'warning', 'success', 'danger']).withMessage('variant invalide')
];

const pricingValidation = [
  body('pricingPlans').optional().isArray().withMessage('pricingPlans invalide'),
  body('companyTypePrices').optional().isObject().withMessage('companyTypePrices invalide')
];

// Routes
router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/companies', getAllCompanies);
router.get('/documents', getAllDocuments);
router.get('/stats', getDetailedStats);
router.put('/companies/:id/status', statusValidation, validate, updateCompanyStatus);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', roleValidation, validate, updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/settings/banner', getBannerSetting);
router.put('/settings/banner', bannerValidation, validate, updateBannerSetting);

router.get('/settings/pricing', getPricingSetting);
router.put('/settings/pricing', pricingValidation, validate, updatePricingSetting);

export default router;
