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
  getCompaniesList,
  toggleUserStatus,
  updateUserRole,
  updateCompanyStatus
} from '../controllers/admin.controller.js';
import {
  getAdminBanner,
  updateAdminBanner,
  getAdminPricing,
  updateAdminPricing,
  getAdminServicesContent,
  updateAdminServicesContent,
  getAdminFiscaliteContent,
  updateAdminFiscaliteContent,
} from '../controllers/settings.controller.js';

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
router.get('/companies-list', getCompaniesList);

// Paramètres du site (admin)
router.get('/settings/banner', getAdminBanner);
router.put('/settings/banner', updateAdminBanner);
router.get('/settings/pricing', getAdminPricing);
router.put('/settings/pricing', updateAdminPricing);
router.get('/settings/services-content', getAdminServicesContent);
router.put('/settings/services-content', updateAdminServicesContent);
router.get('/settings/fiscalite-content', getAdminFiscaliteContent);
router.put('/settings/fiscalite-content', updateAdminFiscaliteContent);

export default router;
