import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Créer un utilisateur
  static async create(userData) {
    const {
      email,
      password,
      firstName = '',
      lastName = '',
      phone = null,
      role = 'user'
    } = userData;
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (email, password, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [email, hashedPassword, firstName, lastName, phone, role]);
    return result.insertId;
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users[0] || null;
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const sql = 'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  // Mettre à jour un utilisateur
  static async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.firstName) {
      fields.push('first_name = ?');
      values.push(userData.firstName);
    }
    if (userData.lastName) {
      fields.push('last_name = ?');
      values.push(userData.lastName);
    }
    if (userData.phone) {
      fields.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.password) {
      fields.push('password = ?');
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      values.push(hashedPassword);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, values);
    return result.affectedRows > 0;
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Obtenir tous les utilisateurs (admin)
  static async getAll(filters = {}) {
    let sql = 'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, last_login FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    sql += ' ORDER BY created_at DESC';

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

  // Compter les utilisateurs
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    const result = await query(sql, params);
    return result[0].total;
  }

  // Désactiver un utilisateur
  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Activer un utilisateur
  static async activate(id) {
    const sql = 'UPDATE users SET is_active = TRUE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await query(sql, [id]);
  }

  // Supprimer un utilisateur
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

export default User;
