import { query } from '../config/database.js';

class SiteSetting {
  static async get(key) {
    const rows = await query('SELECT `key`, value_json, updated_at FROM site_settings WHERE `key` = ? LIMIT 1', [key]);
    if (!rows[0]) return null;
    return rows[0];
  }

  static async set(key, value) {
    const valueJson = JSON.stringify(value ?? null);
    await query(
      'INSERT INTO site_settings (`key`, value_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
      [key, valueJson],
    );
    return await this.get(key);
  }
}

export default SiteSetting;
