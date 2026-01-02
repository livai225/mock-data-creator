import { query } from '../config/database.js';

// @desc    Get dashboard overview statistics
// @route   GET /api/admin/stats/overview
// @access  Private (Admin only)
export const getOverviewStats = async (req, res, next) => {
  try {
    // Statistiques utilisateurs
    const usersStats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_last_7_days,
        SUM(CASE WHEN DATE(updated_at) >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as active_last_24h
      FROM users
    `);

    // Statistiques entreprises
    const companiesStats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_last_7_days,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid
      FROM companies
    `);

    // Statistiques paiements
    const paymentsStats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'completed' AND DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as revenue_last_30_days,
        AVG(CASE 
          WHEN status = 'completed' AND validated_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, created_at, validated_at) 
          ELSE NULL 
        END) as avg_validation_time_minutes
      FROM payments
    `);

    // Taux de validation
    const validationRate = await query(`
      SELECT 
        COUNT(*) as total_submitted,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as validation_rate
      FROM payments
      WHERE status IN ('completed', 'rejected')
    `);

    // Statistiques documents
    const documentsStats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) >= CURDATE() THEN 1 ELSE 0 END) as generated_today,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as generated_last_7_days
      FROM documents
    `);

    // Paiements récents en attente
    const recentPendingPayments = await query(`
      SELECT 
        p.id,
        p.amount,
        p.payment_reference,
        p.created_at,
        c.company_name,
        u.first_name,
        u.last_name,
        u.email
      FROM payments p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Entreprises récentes non payées
    const unpaidCompanies = await query(`
      SELECT 
        c.id,
        c.company_name,
        c.company_type,
        c.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.payment_status = 'unpaid'
      AND DATE(c.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        users: usersStats[0],
        companies: companiesStats[0],
        payments: {
          ...paymentsStats[0],
          validation_rate: validationRate[0]?.validation_rate || 0
        },
        documents: documentsStats[0],
        alerts: {
          pendingPayments: recentPendingPayments,
          unpaidCompanies: unpaidCompanies
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats overview:', error);
    next(error);
  }
};

// @desc    Get revenue statistics over time
// @route   GET /api/admin/stats/revenue
// @access  Private (Admin only)
export const getRevenueStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '365d') days = 365;

    // Revenus par jour
    const revenueByDay = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount) as revenue
      FROM payments
      WHERE status = 'completed'
        AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    // Revenus par mois (12 derniers mois)
    const revenueByMonth = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as revenue
      FROM payments
      WHERE status = 'completed'
        AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Revenus par type de société
    const revenueByType = await query(`
      SELECT 
        c.company_type,
        COUNT(*) as count,
        SUM(p.amount) as revenue
      FROM payments p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.status = 'completed'
      GROUP BY c.company_type
      ORDER BY revenue DESC
    `);

    res.json({
      success: true,
      data: {
        byDay: revenueByDay,
        byMonth: revenueByMonth,
        byType: revenueByType
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats revenus:', error);
    next(error);
  }
};

// @desc    Get companies statistics over time
// @route   GET /api/admin/stats/companies
// @access  Private (Admin only)
export const getCompaniesStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '365d') days = 365;

    // Entreprises créées par jour
    const companiesByDay = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM companies
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    // Entreprises par type
    const companiesByType = await query(`
      SELECT 
        company_type,
        COUNT(*) as count
      FROM companies
      GROUP BY company_type
      ORDER BY count DESC
    `);

    // Entreprises par statut de paiement
    const companiesByPaymentStatus = await query(`
      SELECT 
        payment_status,
        COUNT(*) as count
      FROM companies
      GROUP BY payment_status
    `);

    res.json({
      success: true,
      data: {
        byDay: companiesByDay,
        byType: companiesByType,
        byPaymentStatus: companiesByPaymentStatus
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats entreprises:', error);
    next(error);
  }
};

// @desc    Get users statistics over time
// @route   GET /api/admin/stats/users
// @access  Private (Admin only)
export const getUsersStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '365d') days = 365;

    // Utilisateurs inscrits par jour
    const usersByDay = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    // Taux de conversion (inscription → création entreprise)
    const conversionRate = await query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT c.user_id) as users_with_company,
        (COUNT(DISTINCT c.user_id) / COUNT(DISTINCT u.id)) * 100 as conversion_rate
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.role = 'client'
    `);

    res.json({
      success: true,
      data: {
        byDay: usersByDay,
        conversion: conversionRate[0]
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats utilisateurs:', error);
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/stats/activities
// @access  Private (Admin only)
export const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Combiner différentes activités
    const activities = [];

    // Entreprises récentes
    const recentCompanies = await query(`
      SELECT 
        'company_created' as type,
        c.id as entity_id,
        c.company_name as entity_name,
        c.created_at,
        u.first_name,
        u.last_name
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `, [limit]);

    // Paiements récents
    const recentPayments = await query(`
      SELECT 
        CASE 
          WHEN p.status = 'completed' THEN 'payment_validated'
          WHEN p.status = 'pending' THEN 'payment_submitted'
          WHEN p.status = 'rejected' THEN 'payment_rejected'
        END as type,
        p.id as entity_id,
        CONCAT(c.company_name, ' - ', p.amount, ' FCFA') as entity_name,
        p.created_at,
        u.first_name,
        u.last_name
      FROM payments p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limit]);

    // Utilisateurs récents
    const recentUsers = await query(`
      SELECT 
        'user_registered' as type,
        id as entity_id,
        CONCAT(first_name, ' ', last_name) as entity_name,
        created_at,
        first_name,
        last_name
      FROM users
      WHERE role = 'client'
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);

    // Combiner et trier
    const allActivities = [
      ...recentCompanies,
      ...recentPayments,
      ...recentUsers
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
     .slice(0, limit);

    res.json({
      success: true,
      data: allActivities
    });
  } catch (error) {
    console.error('Erreur récupération activités récentes:', error);
    next(error);
  }
};
