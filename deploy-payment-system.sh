#!/bin/bash

# Script de déploiement du système de paiement manuel
# Date: 2026-01-02

set -e  # Arrêter en cas d'erreur

echo "=========================================="
echo "🚀 DÉPLOIEMENT SYSTÈME DE PAIEMENT MANUEL"
echo "=========================================="
echo ""

# Configuration
SERVER_USER="hexpertise"
SERVER_HOST="vmi2967615.contaboserver.net"
PROJECT_PATH="/var/www/mock-data-creator"
BACKEND_PATH="$PROJECT_PATH/backend"
DB_NAME="arch_excellence"

echo "📋 Étape 1: Commit et push des modifications locales"
echo "------------------------------------------------"
git add .
git status
read -p "Voulez-vous commiter ces modifications ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]
then
    read -p "Message du commit: " COMMIT_MSG
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "✅ Code poussé sur GitHub"
else
    echo "⚠️  Commit annulé"
    exit 1
fi

echo ""
echo "📥 Étape 2: Connexion au serveur et pull du code"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    cd /var/www/mock-data-creator
    echo "📥 Pull du code..."
    git pull origin main
    echo "✅ Code mis à jour"
EOF

echo ""
echo "🗄️  Étape 3: Migration de la base de données"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "📊 Application de la migration SQL..."
    sudo mysql arch_excellence -e "
        -- Ajout des colonnes pour la preuve de paiement
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_path VARCHAR(255) COMMENT 'Chemin vers la capture du reçu';
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100) COMMENT 'Référence de la transaction';
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT COMMENT 'Raison du rejet si applicable';
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_by INT COMMENT 'ID de l\'admin qui a validé';
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_at DATETIME COMMENT 'Date de validation';

        -- Modifier payment_method pour ajouter 'manual_transfer'
        ALTER TABLE payments MODIFY COLUMN payment_method ENUM('card', 'mobile_money', 'bank_transfer', 'cash', 'manual_transfer') NOT NULL;

        -- Ajouter le statut 'rejected'
        ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded', 'rejected') DEFAULT 'pending';

        -- Modifier payment_status dans companies
        ALTER TABLE companies MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid';

        -- Index pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_payment_company ON payments(company_id);
        CREATE INDEX IF NOT EXISTS idx_payment_user ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payment_validated_by ON payments(validated_by);

        SELECT '✅ Migration terminée avec succès!' as Status;
    "
EOF

echo ""
echo "📁 Étape 4: Création des dossiers d'uploads"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    cd /var/www/mock-data-creator/backend
    
    # Créer le dossier uploads/payments s'il n'existe pas
    mkdir -p uploads/payments
    
    # Définir les permissions appropriées
    chmod 755 uploads
    chmod 755 uploads/payments
    
    echo "✅ Dossiers créés et permissions définies"
    ls -la uploads/
EOF

echo ""
echo "📦 Étape 5: Installation des dépendances backend"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    cd /var/www/mock-data-creator/backend
    echo "📦 Installation des dépendances npm..."
    npm install
    echo "✅ Dépendances installées"
EOF

echo ""
echo "🔄 Étape 6: Redémarrage du backend (PM2)"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    pm2 restart arch-excellence-api
    echo "✅ Backend redémarré"
    pm2 status
EOF

echo ""
echo "🎨 Étape 7: Build et déploiement du frontend"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    cd /var/www/mock-data-creator
    echo "🏗️  Build du frontend..."
    npm run build
    
    echo "🔄 Rechargement de Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Frontend déployé"
EOF

echo ""
echo "🧪 Étape 8: Vérifications post-déploiement"
echo "------------------------------------------------"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "🔍 Vérification du backend..."
    pm2 logs arch-excellence-api --lines 10 --nostream
    
    echo ""
    echo "🔍 Vérification du build frontend..."
    ls -lh /var/www/mock-data-creator/dist/
EOF

echo ""
echo "=========================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "=========================================="
echo ""
echo "🌐 Application accessible sur: http://31.220.82.109"
echo "🔧 Page admin paiements: http://31.220.82.109/admin/paiements"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Tester la création d'une entreprise"
echo "  2. Tester la soumission d'un paiement manuel"
echo "  3. Tester la validation/rejet en tant qu'admin"
echo ""
