import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getOverviewStats,
  getRevenueStats,
  getCompaniesStats,
  getUsersStats,
  getRecentActivities
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

export default router;
