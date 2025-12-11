import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getDashboard,
  getAllUsers,
  getAllCompanies,
  updateCompanyStatus,
  toggleUserStatus,
  deleteUser,
  getDetailedStats
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

// Routes
router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/companies', getAllCompanies);
router.get('/stats', getDetailedStats);
router.put('/companies/:id/status', statusValidation, validate, updateCompanyStatus);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
