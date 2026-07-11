import { query } from '../config/database.js';

class Payment {
  // Générer une référence de paiement unique
  static generateReference() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PAY-${ts}-${rand}`;
  }

  // Créer une demande de paiement
  static async create(paymentData) {
    const {
      // snake_case (nouveau style)
      user_id, company_id, payment_method, currency,
      // camelCase (ancien style — compatibilité)
      userId, companyId, paymentMethod,
      amount,
      phoneNumber, phone_number,
      transactionReference, transaction_reference,
      proofImagePath, proof_image_path,
      status = 'pending',
      metadata, payment_proof_path, transaction_reference: txRef
    } = paymentData;

    const uid = user_id || userId;
    const cid = company_id || companyId;
    const method = payment_method || paymentMethod || 'genius_pay';
    const phone = phone_number || phoneNumber || null;
    const txReference = transaction_reference || transactionReference || txRef || null;
    const proofPath = payment_proof_path || proof_image_path || proofImagePath || null;
    const curr = currency || 'XOF';
    const ref = this.generateReference();

    const sql = `
      INSERT INTO payments
      (payment_reference, company_id, user_id, amount, currency, payment_method, phone_number, transaction_reference, proof_image_path, metadata, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      ref, cid, uid, amount, curr, method, phone, txReference, proofPath,
      metadata ? JSON.stringify(metadata) : null,
      status
    ]);

    return result.insertId;
  }

  // Mettre à jour le statut d'un paiement
  static async updateStatus(id, status, transactionId = null, metadata = null) {
    const sql = `
      UPDATE payments
      SET status = ?,
          transaction_reference = COALESCE(?, transaction_reference),
          metadata = COALESCE(?, metadata),
          updated_at = NOW()
      WHERE id = ?
    `;
    await query(sql, [status, transactionId || null, metadata ? JSON.stringify(metadata) : null, id]);
  }

  // Trouver un paiement par sa référence interne (PAY-xxx)
  static async findByReference(reference) {
    const results = await query('SELECT * FROM payments WHERE payment_reference = ? LIMIT 1', [reference]);
    return results[0] || null;
  }

  // Trouver un paiement par la référence de transaction (Genius Pay)
  static async findByTransactionId(transactionId) {
    const results = await query('SELECT * FROM payments WHERE transaction_reference = ? LIMIT 1', [transactionId]);
    return results[0] || null;
  }

  // Trouver un paiement par ID
  static async findById(id) {
    const sql = `
      SELECT p.*, 
        c.company_name,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM payments p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // Trouver les paiements d'une entreprise
  static async findByCompanyId(companyId) {
    const sql = `
      SELECT p.*
      FROM payments p
      WHERE p.company_id = ?
      ORDER BY p.created_at DESC
    `;
    
    return await query(sql, [companyId]);
  }

  // Trouver les paiements d'un utilisateur
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

  // Obtenir tous les paiements (admin)
  static async getAll(filters = {}) {
    let sql = `
      SELECT p.*, 
        c.company_name,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
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

    return await query(sql, params);
  }

  // Vérifier/Approuver un paiement
  static async verify(id, adminId, status = 'verified', adminNotes = null) {
    const sql = `
      UPDATE payments 
      SET status = ?, 
          admin_notes = ?,
          verified_by = ?,
          verified_at = NOW()
      WHERE id = ?
    `;

    const result = await query(sql, [status, adminNotes, adminId, id]);

    // Si vérifié, mettre à jour le statut de l'entreprise
    if (status === 'verified' && result.affectedRows > 0) {
      const payment = await this.findById(id);
      if (payment) {
        await query(
          'UPDATE companies SET payment_status = ? WHERE id = ?',
          ['paid', payment.company_id]
        );
      }
    }

    // Si rejeté, remettre le statut à unpaid
    if (status === 'rejected' && result.affectedRows > 0) {
      const payment = await this.findById(id);
      if (payment) {
        await query(
          'UPDATE companies SET payment_status = ? WHERE id = ?',
          ['unpaid', payment.company_id]
        );
      }
    }

    return result.affectedRows > 0;
  }

  // Compter les paiements
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }

    const result = await query(sql, params);
    return result[0].total;
  }

  // Statistiques des paiements
  static async getStats() {
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as total_revenue
      FROM payments
    `);

    return stats[0];
  }

  // Supprimer un paiement
  static async delete(id) {
    const sql = 'DELETE FROM payments WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Obtenir tous les paiements en attente de validation (pour admin)
  static async getPendingPayments(limit = 50) {
    const sql = `
      SELECT p.*, 
        u.email as user_email, 
        u.first_name as user_first_name, 
        u.last_name as user_last_name,
        c.company_name, 
        c.company_type
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.status = 'pending' AND p.payment_method = 'manual_transfer'
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }

  // Valider un paiement manuel (admin)
  static async validatePayment(id, adminId, notes = null) {
    const sql = `
      UPDATE payments 
      SET status = 'completed', 
          validated_by = ?, 
          validated_at = NOW(),
          metadata = JSON_SET(COALESCE(metadata, '{}'), '$.validation_notes', ?)
      WHERE id = ? AND status = 'pending'
    `;
    const result = await query(sql, [adminId, notes || '', id]);
    return result.affectedRows > 0;
  }

  // Rejeter un paiement manuel (admin)
  static async rejectPayment(id, adminId, reason) {
    const sql = `
      UPDATE payments 
      SET status = 'rejected', 
          rejection_reason = ?,
          validated_by = ?, 
          validated_at = NOW()
      WHERE id = ? AND status = 'pending'
    `;
    const result = await query(sql, [reason, adminId, id]);
    return result.affectedRows > 0;
  }

  // Obtenir le dernier paiement d'une entreprise (validé ou en attente)
  static async getLastValidPayment(companyId) {
    const sql = `
      SELECT * FROM payments 
      WHERE company_id = ? 
        AND status IN ('completed', 'pending')
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const results = await query(sql, [companyId]);
    return results[0] || null;
  }

  // Vérifier si une entreprise a un paiement validé
  static async hasValidPayment(companyId) {
    const sql = `
      SELECT COUNT(*) as count FROM payments 
      WHERE company_id = ? AND status = 'completed'
    `;
    const result = await query(sql, [companyId]);
    return result[0].count > 0;
  }
}

export default Payment;
