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
      SELECT id, user_id, company_id, doc_type, doc_name, file_name, mime_type, created_at
      FROM documents
      WHERE user_id = ?
      ORDER BY created_at DESC
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
}

export default Document;
