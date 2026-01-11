import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getOverviewStats,
  getRevenueStats,
  getCompaniesStats,
  getUsersStats,
  getRecentActivities,
  getAllUsers,
  getAllCompanies,
  getAllDocuments,
  toggleUserStatus,
  updateUserRole,
  updateCompanyStatus
} from '../controllers/admin.controller.js';

const router = express.Router();

// Toutes les routes sont protégées et admin only
router.use(protect, adminOnly);

// Statistiques
router.get('/stats/overview', getOverviewStats);
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/companies', getCompaniesStats);
router.get('/stats/users', getUsersStats);
router.get('/stats/activities', getRecentActivities);

// Gestion des utilisateurs
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

// Gestion des entreprises
router.get('/companies', getAllCompanies);
router.put('/companies/:id/status', updateCompanyStatus);

// Gestion des documents
router.get('/documents', getAllDocuments);

export default router;
