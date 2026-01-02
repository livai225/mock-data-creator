/**
 * Script pour appliquer la migration 004
 * Ajoute les colonnes manquantes dans la table managers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hexcellence',
  multipleStatements: true
};

async function applyMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connexion établie\n');

    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '../sql/004_add_missing_manager_fields.sql');
    console.log(`📄 Lecture du fichier: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Exécuter la migration
    console.log('🚀 Application de la migration 004...\n');
    await connection.query(sql);
    console.log('✅ Migration 004 appliquée avec succès!\n');

    // Vérifier que les colonnes ont été ajoutées
    console.log('🔍 Vérification des colonnes ajoutées...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM managers 
      WHERE Field IN ('profession', 'date_validite_id', 'ville_residence')
    `);

    if (columns.length === 3) {
      console.log('✅ Toutes les colonnes ont été ajoutées avec succès:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } else {
      console.warn('⚠️  Certaines colonnes pourraient ne pas avoir été ajoutées correctement');
      console.warn(`   Colonnes trouvées: ${columns.length}/3`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Connexion fermée');
    }
  }
}

// Exécuter le script
applyMigration();
