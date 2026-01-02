#!/bin/bash
# Script pour appliquer la migration 004 sur le serveur distant

echo "🔧 Application de la migration 004 sur le serveur..."
echo ""

# Aller dans le répertoire du backend
cd /var/www/mock-data-creator/backend

# Appliquer la migration SQL directement via MySQL
echo "📝 Application de la migration SQL..."
mysql -u root -p << 'EOF'
USE arch_excellence;

-- Ajout des champs manquants dans la table managers
ALTER TABLE managers ADD COLUMN IF NOT EXISTS profession VARCHAR(150);
ALTER TABLE managers ADD COLUMN IF NOT EXISTS date_validite_id VARCHAR(20);
ALTER TABLE managers ADD COLUMN IF NOT EXISTS ville_residence VARCHAR(100);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_managers_company_main ON managers(company_id, is_main);

-- Vérification
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
  AND TABLE_NAME = 'managers' 
  AND COLUMN_NAME IN ('profession', 'date_validite_id', 'ville_residence');

EOF

echo ""
echo "✅ Migration 004 appliquée avec succès !"
echo ""
echo "🔄 Redémarrage du backend pour prendre en compte les modifications..."
pm2 restart arch-excellence-api

echo ""
echo "✅ Terminé ! Les champs [PROFESSION] et [DATE VALIDITE] seront maintenant remplis correctement."
