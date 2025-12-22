import { query } from '../config/database.js';

class Payment {
  // Créer un paiement
  static async create(paymentData) {
    const {
      userId,
      companyId,
      amount,
      description,
      paymentMethod = 'pending',
      status = 'pending'
    } = paymentData;

    const sql = `
      INSERT INTO payments (user_id, company_id, amount, description, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [userId, companyId, amount, description, paymentMethod, status]);
    return result.insertId;
  }

  // Trouver par ID
  static async findById(id) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Trouver par utilisateur
  static async findByUserId(userId) {
    const sql = `
      SELECT p.*, c.company_name 
      FROM payments p 
      LEFT JOIN companies c ON p.company_id = c.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  // Trouver par entreprise
  static async findByCompanyId(companyId) {
    const sql = 'SELECT * FROM payments WHERE company_id = ? ORDER BY created_at DESC';
    return await query(sql, [companyId]);
  }

  // Mettre à jour le statut
  static async updateStatus(id, status, paymentReference = null, paymentDate = null) {
    let sql = 'UPDATE payments SET status = ?';
    const params = [status];

    if (paymentReference) {
      sql += ', payment_reference = ?';
      params.push(paymentReference);
    }

    if (paymentDate) {
      sql += ', payment_date = ?';
      params.push(paymentDate);
    }

    if (status === 'completed') {
      sql += ', payment_date = COALESCE(payment_date, NOW())';
    }

    sql += ', updated_at = NOW() WHERE id = ?';
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Statistiques utilisateur
  static async getUserStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount
      FROM payments 
      WHERE user_id = ?
    `;
    const results = await query(sql, [userId]);
    return results[0] || { total: 0, pending: 0, completed: 0, total_amount: 0 };
  }

  // Tous les paiements (admin)
  static async findAll(filters = {}) {
    let sql = `
      SELECT p.*, c.company_name, u.email as user_email, u.first_name, u.last_name
      FROM payments p 
      LEFT JOIN companies c ON p.company_id = c.id 
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.userId) {
      sql += ' AND p.user_id = ?';
      params.push(filters.userId);
    }

    sql += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    return await query(sql, params);
  }
}

export default Payment;

