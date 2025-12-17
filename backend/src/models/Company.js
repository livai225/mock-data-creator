import { query, transaction } from '../config/database.js';

class Company {
  // Créer une entreprise
  static async create(companyData, associates = []) {
    return await transaction(async (connection) => {
      const {
        userId,
        companyType,
        companyName,
        activity,
        capital,
        address,
        city,
        gerant, // Legacy field, kept for quick display or backward compat
        paymentAmount,
        chiffreAffairesPrev,
        managers = [] // New array of managers
      } = companyData;

      // Insérer l'entreprise
      const [result] = await connection.execute(
        `INSERT INTO companies 
        (user_id, company_type, company_name, activity, capital, address, city, gerant, payment_amount, chiffre_affaires_prev, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [userId, companyType, companyName, activity, capital, address, city, gerant, paymentAmount, chiffreAffairesPrev]
      );

      const companyId = result.insertId;

      // Insérer les associés
      if (associates.length > 0) {
        const totalParts = associates.reduce((sum, a) => sum + parseInt(a.parts), 0);
        
        for (const associate of associates) {
          const percentage = (parseInt(associate.parts) / totalParts) * 100;
          await connection.execute(
            'INSERT INTO associates (company_id, name, parts, percentage) VALUES (?, ?, ?, ?)',
            [companyId, associate.name, associate.parts, percentage.toFixed(2)]
          );
        }
      }

      // Insérer les gérants
      if (managers.length > 0) {
        for (const mgr of managers) {
          await connection.execute(
            `INSERT INTO managers 
            (company_id, nom, prenoms, date_naissance, lieu_naissance, nationalite, adresse, 
             type_identite, numero_identite, date_delivrance_id, lieu_delivrance_id, 
             pere_nom, mere_nom, duree_mandat, is_main)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              companyId, mgr.nom, mgr.prenoms, mgr.dateNaissance, mgr.lieuNaissance, 
              mgr.nationalite, mgr.adresse, mgr.typeIdentite, mgr.numeroIdentite,
              mgr.dateDelivranceId, mgr.lieuDelivranceId, mgr.pereNom, mgr.mereNom,
              mgr.dureeMandat, mgr.isMain || false
            ]
          );
        }
      }

      return companyId;
    });
  }

  // Trouver une entreprise par ID
  static async findById(id) {
    const sql = `
      SELECT c.*, 
        u.email as user_email, 
        u.first_name as user_first_name, 
        u.last_name as user_last_name
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    const companies = await query(sql, [id]);
    
    if (companies.length === 0) return null;

    const company = companies[0];

    // Récupérer les associés
    const associates = await query(
      'SELECT id, name, parts, percentage FROM associates WHERE company_id = ?',
      [id]
    );

    // Récupérer les gérants
    const managers = await query(
      'SELECT * FROM managers WHERE company_id = ?',
      [id]
    );

    company.associates = associates;
    company.managers = managers;
    
    return company;
  }

  // Obtenir les entreprises d'un utilisateur
  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM companies WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    return await query(sql, params);
  }

  // Obtenir toutes les entreprises (admin)
  static async getAll(filters = {}) {
    let sql = `
      SELECT c.*, 
        u.email as user_email, 
        u.first_name as user_first_name, 
        u.last_name as user_last_name
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND c.status = ?';
      params.push(filters.status);
    }

    if (filters.companyType) {
      sql += ' AND c.company_type = ?';
      params.push(filters.companyType);
    }

    if (filters.paymentStatus) {
      sql += ' AND c.payment_status = ?';
      params.push(filters.paymentStatus);
    }

    sql += ' ORDER BY c.created_at DESC';

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

  // Mettre à jour le statut
  static async updateStatus(id, status, adminNotes = null) {
    let sql = 'UPDATE companies SET status = ?';
    const params = [status];

    if (adminNotes) {
      sql += ', admin_notes = ?';
      params.push(adminNotes);
    }

    if (status === 'completed') {
      sql += ', completed_at = NOW()';
    }

    sql += ' WHERE id = ?';
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Mettre à jour le statut de paiement
  static async updatePayment(id, paymentData) {
    const { paymentStatus, paymentReference, paymentDate } = paymentData;
    
    const sql = `
      UPDATE companies 
      SET payment_status = ?, payment_reference = ?, payment_date = ?
      WHERE id = ?
    `;
    
    const result = await query(sql, [paymentStatus, paymentReference, paymentDate, id]);
    return result.affectedRows > 0;
  }

  // Mettre à jour une entreprise
  static async update(id, companyData) {
    const fields = [];
    const values = [];

    const allowedFields = ['company_name', 'activity', 'capital', 'address', 'city', 'gerant', 'notes'];
    
    for (const field of allowedFields) {
      if (companyData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(companyData[field]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  // Compter les entreprises
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM companies WHERE 1=1';
    const params = [];

    if (filters.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    const result = await query(sql, params);
    return result[0].total;
  }

  // Statistiques
  static async getStats() {
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN payment_status = 'paid' THEN payment_amount ELSE 0 END) as total_revenue
      FROM companies
    `);

    return stats[0];
  }

  // Supprimer une entreprise
  static async delete(id) {
    const sql = 'DELETE FROM companies WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

export default Company;
