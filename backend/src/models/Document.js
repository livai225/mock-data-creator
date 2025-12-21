import { query } from '../config/database.js';

class Document {
  static async create({
    userId,
    companyId = null,
    docType,
    docName,
    fileName,
    filePath,
    mimeType = 'application/pdf'
  }) {
    const sql = `
      INSERT INTO documents (user_id, company_id, doc_type, doc_name, file_name, file_path, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [userId, companyId, docType, docName, fileName, filePath, mimeType]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT d.id, d.user_id, d.company_id, d.doc_type, d.doc_name, d.file_name, d.mime_type, d.created_at
      FROM documents d
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE d.user_id = ?
        AND (d.company_id IS NULL OR c.id IS NOT NULL)
      ORDER BY d.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  static async findById(id) {
    const sql = `
      SELECT id, user_id, company_id, doc_type, doc_name, file_name, file_path, mime_type, created_at
      FROM documents
      WHERE id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByCompanyId(companyId) {
    const sql = `
      SELECT id, user_id, company_id, doc_type, doc_name, file_name, file_path, mime_type, created_at
      FROM documents
      WHERE company_id = ?
    `;
    return await query(sql, [companyId]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM documents WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByCompanyId(companyId) {
    const sql = 'DELETE FROM documents WHERE company_id = ?';
    const result = await query(sql, [companyId]);
    return result.affectedRows > 0;
  }
}

export default Document;
