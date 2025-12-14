import User from '../models/User.js';
import Company from '../models/Company.js';
import { AppError } from '../middleware/errorHandler.js';
import { query } from '../config/database.js';
import SiteSetting from '../models/SiteSetting.js';

const safeJsonParse = (valueJson) => {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
};

// @desc    Obtenir le dashboard admin
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboard = async (req, res, next) => {
  try {
    // Statistiques générales
    const totalUsers = await User.count({ role: 'user' });
    const activeUsers = await User.count({ role: 'user', isActive: true });
    const companyStats = await Company.getStats();

    // Entreprises récentes
    const recentCompanies = await Company.getAll({ limit: 10 });

    // Nouveaux utilisateurs (7 derniers jours)
    const newUsers = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND role = 'user'
    `);

    // Revenus du mois
    const monthlyRevenue = await query(`
      SELECT SUM(payment_amount) as revenue
      FROM companies
      WHERE payment_status = 'paid' 
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
    `);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisWeek: newUsers[0].count
        },
        companies: {
          total: companyStats.total,
          completed: companyStats.completed,
          pending: companyStats.pending,
          processing: companyStats.processing
        },
        revenue: {
          total: companyStats.total_revenue || 0,
          thisMonth: monthlyRevenue[0].revenue || 0
        },
        recentCompanies
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, limit = 50, offset = 0 } = req.query;

    const filters = {
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const users = await User.getAll(filters);
    const total = await User.count({ role, isActive: filters.isActive });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        count: users.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les entreprises
// @route   GET /api/admin/companies
// @access  Private/Admin
export const getAllCompanies = async (req, res, next) => {
  try {
    const { status, companyType, paymentStatus, limit = 50, offset = 0 } = req.query;

    const filters = {
      status,
      companyType,
      paymentStatus,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const companies = await Company.getAll(filters);
    const total = await Company.count({ status });

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        total,
        count: companies.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le statut d'une entreprise
// @route   PUT /api/admin/companies/:id/status
// @access  Private/Admin
export const updateCompanyStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    const validStatuses = ['draft', 'pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Statut invalide', 400));
    }

    await Company.updateStatus(req.params.id, status, adminNotes);

    // TODO: Envoyer une notification à l'utilisateur

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activer/Désactiver un utilisateur
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Impossible de modifier le statut d\'un administrateur', 400));
    }

    const newStatus = !user.is_active;
    
    if (newStatus) {
      await User.activate(req.params.id);
    } else {
      await User.deactivate(req.params.id);
    }

    res.status(200).json({
      success: true,
      message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Impossible de supprimer un administrateur', 400));
    }

    await User.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques détaillées
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDetailedStats = async (req, res, next) => {
  try {
    // Statistiques par type d'entreprise
    const companyTypeStats = await query(`
      SELECT company_type, COUNT(*) as count, SUM(payment_amount) as revenue
      FROM companies
      WHERE payment_status = 'paid'
      GROUP BY company_type
    `);

    // Évolution mensuelle
    const monthlyStats = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as companies_created,
        SUM(CASE WHEN payment_status = 'paid' THEN payment_amount ELSE 0 END) as revenue
      FROM companies
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Top utilisateurs
    const topUsers = await query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name,
        COUNT(c.id) as total_companies,
        SUM(CASE WHEN c.payment_status = 'paid' THEN c.payment_amount ELSE 0 END) as total_spent
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        companyTypeStats,
        monthlyStats,
        topUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lister tous les documents (admin)
// @route   GET /api/admin/documents
// @access  Private/Admin
export const getAllDocuments = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, userId } = req.query;

    let sql = `
      SELECT d.id, d.user_id, d.company_id, d.doc_type, d.doc_name, d.file_name, d.mime_type, d.created_at,
             u.email as user_email
      FROM documents d
      LEFT JOIN users u ON u.id = d.user_id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      sql += ' AND d.user_id = ?';
      params.push(parseInt(userId));
    }

    sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const docs = await query(sql, params);

    const totalRows = await query(
      `SELECT COUNT(*) as total FROM documents ${userId ? 'WHERE user_id = ?' : ''}`,
      userId ? [parseInt(userId)] : [],
    );

    res.status(200).json({
      success: true,
      data: docs,
      pagination: {
        total: totalRows[0]?.total ?? 0,
        count: docs.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier le rôle d'un utilisateur (admin/user)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    if (!['user', 'admin'].includes(role)) {
      return next(new AppError('Rôle invalide', 400));
    }

    if (req.user.id === userId) {
      return next(new AppError('Impossible de modifier votre propre rôle', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    await User.updateRole(userId, role);

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir la bannière (admin)
// @route   GET /api/admin/settings/banner
// @access  Private/Admin
export const getBannerSetting = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('banner');
    const value = row ? safeJsonParse(row.value_json) : null;
    res.status(200).json({
      success: true,
      data: value ?? { enabled: false, message: '', variant: 'info' }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour la bannière (admin)
// @route   PUT /api/admin/settings/banner
// @access  Private/Admin
export const updateBannerSetting = async (req, res, next) => {
  try {
    const { enabled = false, message = '', variant = 'info' } = req.body;

    const saved = await SiteSetting.set('banner', {
      enabled: Boolean(enabled),
      message: String(message),
      variant: String(variant)
    });

    res.status(200).json({
      success: true,
      message: 'Bannière mise à jour',
      data: safeJsonParse(saved.value_json)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir la tarification (admin)
// @route   GET /api/admin/settings/pricing
// @access  Private/Admin
export const getPricingSetting = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('pricing');
    const value = row ? safeJsonParse(row.value_json) : null;
    res.status(200).json({
      success: true,
      data: value ?? { pricingPlans: [], companyTypePrices: {} }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour la tarification (admin)
// @route   PUT /api/admin/settings/pricing
// @access  Private/Admin
export const updatePricingSetting = async (req, res, next) => {
  try {
    const { pricingPlans = [], companyTypePrices = {} } = req.body;

    const saved = await SiteSetting.set('pricing', {
      pricingPlans,
      companyTypePrices
    });

    res.status(200).json({
      success: true,
      message: 'Tarification mise à jour',
      data: safeJsonParse(saved.value_json)
    });
  } catch (error) {
    next(error);
  }
};
