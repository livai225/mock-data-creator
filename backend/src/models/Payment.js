import { query } from '../config/database.js';
import crypto from 'crypto';

class Payment {
  // Créer un paiement
  static async create(paymentData) {
    const {
      user_id,
      company_id = null,
      amount,
      currency = 'FCFA',
      payment_method = 'mobile_money',
      status = 'pending'
    } = paymentData;
    
    // Générer une référence unique
    const payment_reference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    const sql = `
      INSERT INTO payments (user_id, company_id, amount, currency, payment_method, payment_reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      user_id,
      company_id,
      amount,
      currency,
      payment_method,
      payment_reference,
      status
    ]);
    
    return result.insertId;
  }

  // Trouver un paiement par ID
  static async findById(id) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  // Trouver un paiement par référence
  static async findByReference(reference) {
    const sql = 'SELECT * FROM payments WHERE payment_reference = ?';
    const rows = await query(sql, [reference]);
    return rows[0] || null;
  }

  // Trouver les paiements d'un utilisateur
  static async findByUserId(userId) {
    const sql = 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC';
    return await query(sql, [userId]);
  }

  // Trouver les paiements d'une entreprise
  static async findByCompanyId(companyId) {
    const sql = 'SELECT * FROM payments WHERE company_id = ? ORDER BY created_at DESC';
    return await query(sql, [companyId]);
  }

  // Mettre à jour le statut d'un paiement
  static async updateStatus(id, status, transactionId = null, metadata = null) {
    const sql = `
      UPDATE payments 
      SET status = ?, 
          transaction_id = ?,
          metadata = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    await query(sql, [status, transactionId, metadataJson, id]);
    
    return await this.findById(id);
  }

  // Vérifier si une entreprise a un paiement validé
  static async hasValidPayment(companyId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM payments 
      WHERE company_id = ? AND status = 'completed'
    `;
    const rows = await query(sql, [companyId]);
    return rows[0].count > 0;
  }

  // Obtenir le dernier paiement validé d'une entreprise
  static async getLastValidPayment(companyId) {
    const sql = `
      SELECT * FROM payments 
      WHERE company_id = ? AND status = 'completed'
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    const rows = await query(sql, [companyId]);
    return rows[0] || null;
  }
}

export default Payment;
