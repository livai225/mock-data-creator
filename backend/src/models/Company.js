import { query, transaction } from '../config/database.js';

// Helper function pour convertir undefined en null (compatible toutes versions Node.js)
const toNull = (value) => (value === undefined ? null : value);

// Helper function pour nettoyer un tableau de paramètres (convertir tous les undefined en null)
const cleanParams = (params) => {
  return params.map(param => (param === undefined ? null : param));
};

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
        managers = [], // New array of managers
        declarant = {}, // Informations du déclarant
        projections = {}, // Projections sur 3 ans
        // Champs de localisation
        commune,
        quartier,
        lot,
        ilot,
        nomImmeuble,
        numeroEtage,
        numeroPorte,
        section,
        parcelle,
        tfNumero,
        fax,
        adressePostale,
        telephone,
        email
      } = companyData;

      // Insérer l'entreprise
      // Convertir tous les undefined en null pour MySQL (même les champs obligatoires pour éviter les erreurs)
      const params = [
        userId, 
        companyType, 
        companyName, 
        activity, 
        capital, 
        address, 
        city, 
        gerant, 
        paymentAmount, 
        chiffreAffairesPrev,
        declarant.nom,
        declarant.qualite,
        declarant.adresse,
        declarant.telephone,
        declarant.fax,
        declarant.mobile,
        declarant.email,
        projections.investissementAnnee1,
        projections.investissementAnnee2,
        projections.investissementAnnee3,
        projections.emploisAnnee1,
        projections.emploisAnnee2,
        projections.emploisAnnee3,
        // Champs de localisation
        commune,
        quartier,
        lot,
        ilot,
        nomImmeuble,
        numeroEtage,
        numeroPorte,
        section,
        parcelle,
        tfNumero,
        fax,
        adressePostale,
        telephone,
        email
      ];
      
      // Nettoyer tous les paramètres pour s'assurer qu'aucun undefined ne passe
      const cleanParamsArray = cleanParams(params);
      
      const [result] = await connection.execute(
        `INSERT INTO companies 
        (user_id, company_type, company_name, activity, capital, address, city, gerant, payment_amount, chiffre_affaires_prev, 
         declarant_nom, declarant_qualite, declarant_adresse, declarant_telephone, declarant_fax, declarant_mobile, declarant_email,
         investissement_annee1, investissement_annee2, investissement_annee3, emplois_annee1, emplois_annee2, emplois_annee3,
         commune, quartier, lot, ilot, nom_immeuble, numero_etage, numero_porte, section, parcelle, tf_numero, fax, adresse_postale, telephone, email, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        cleanParamsArray
      );

      const companyId = result.insertId;

      // Insérer les associés avec tous les détails
      if (associates.length > 0) {
        const totalParts = associates.reduce((sum, a) => sum + parseInt(a.parts), 0);
        
        for (const associate of associates) {
          const percentage = (parseInt(associate.parts) / totalParts) * 100;
          const associateParams = [
            companyId, 
            associate.name, 
            associate.parts, 
            percentage.toFixed(2),
            associate.profession,
            associate.nationalite,
            associate.dateNaissance,
            associate.lieuNaissance,
            associate.adresse || associate.adresseDomicile,
            associate.typeIdentite,
            associate.numeroIdentite,
            associate.dateDelivranceId,
            associate.dateValiditeId,
            associate.lieuDelivranceId
          ];
          await connection.execute(
            `INSERT INTO associates 
            (company_id, name, parts, percentage, profession, nationalite, date_naissance, lieu_naissance, 
             adresse, type_identite, numero_identite, date_delivrance_id, date_validite_id, lieu_delivrance_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            cleanParams(associateParams)
          );
        }
      }

      // Insérer les gérants
      if (managers.length > 0) {
        for (const mgr of managers) {
          const managerParams = [
            companyId, 
            mgr.nom, 
            mgr.prenoms, 
            mgr.dateNaissance, 
            mgr.lieuNaissance, 
            mgr.nationalite, 
            mgr.adresse, 
            mgr.profession,  // Nouveau champ
            mgr.typeIdentite, 
            mgr.numeroIdentite,
            mgr.dateDelivranceId, 
            mgr.dateValiditeId,  // Nouveau champ
            mgr.lieuDelivranceId, 
            mgr.villeResidence,  // Nouveau champ
            mgr.pereNom, 
            mgr.mereNom,
            mgr.dureeMandat, 
            mgr.isMain === undefined ? false : mgr.isMain
          ];
          await connection.execute(
            `INSERT INTO managers 
            (company_id, nom, prenoms, date_naissance, lieu_naissance, nationalite, adresse, 
             profession, type_identite, numero_identite, date_delivrance_id, date_validite_id,
             lieu_delivrance_id, ville_residence, pere_nom, mere_nom, duree_mandat, is_main)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            cleanParams(managerParams)
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

    // Normaliser les champs de localisation (DB en snake_case vs templates en camelCase)
    // Ne pas écraser si déjà présents.
    if (company.nomImmeuble === undefined && company.nom_immeuble !== undefined) {
      company.nomImmeuble = company.nom_immeuble;
    }
    if (company.numeroEtage === undefined && company.numero_etage !== undefined) {
      company.numeroEtage = company.numero_etage;
    }
    if (company.numeroPorte === undefined && company.numero_porte !== undefined) {
      company.numeroPorte = company.numero_porte;
    }
    if (company.tfNumero === undefined && company.tf_numero !== undefined) {
      company.tfNumero = company.tf_numero;
    }
    if (company.adressePostale === undefined && company.adresse_postale !== undefined) {
      company.adressePostale = company.adresse_postale;
    }

    // Récupérer les associés avec tous les détails
    const associates = await query(
      `SELECT id, name, parts, percentage, profession, nationalite, 
       date_naissance, lieu_naissance, adresse, type_identite, numero_identite,
       date_delivrance_id, date_validite_id, lieu_delivrance_id 
       FROM associates WHERE company_id = ?`,
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
    
    // Convertir undefined en null pour MySQL
    const result = await query(sql, [
      toNull(paymentStatus), 
      toNull(paymentReference), 
      toNull(paymentDate), 
      toNull(id)
    ]);
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
        // Convertir undefined en null pour MySQL
        values.push(companyData[field] === undefined ? null : companyData[field]);
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

  // Mettre à jour le statut de paiement
  static async updatePaymentStatus(id, paymentStatus, paymentAmount = null, paymentReference = null) {
    const fields = ['payment_status = ?'];
    const values = [paymentStatus];

    if (paymentAmount !== null) {
      fields.push('payment_amount = ?');
      values.push(paymentAmount);
    }

    if (paymentReference !== null) {
      fields.push('payment_reference = ?');
      values.push(paymentReference);
    }

    if (paymentStatus === 'paid') {
      fields.push('payment_date = NOW()');
    }

    values.push(id);
    const sql = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }
}

export default Company;
