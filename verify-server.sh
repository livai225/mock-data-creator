#!/bin/bash

# Script de vérification du serveur
# Date: 2026-01-02

echo "=========================================="
echo "🔍 VÉRIFICATION DU SERVEUR"
echo "=========================================="
echo ""

SERVER_USER="hexpertise"
SERVER_HOST="vmi2967615.contaboserver.net"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'

echo "📍 1. Vérification du répertoire projet"
echo "------------------------------------------------"
cd /var/www/mock-data-creator
pwd
echo "✅ Répertoire OK"
echo ""

echo "📦 2. Vérification de la dernière version Git"
echo "------------------------------------------------"
git log -1 --oneline
git status
echo ""

echo "🗄️  3. Vérification de la structure des dossiers"
echo "------------------------------------------------"
echo "Backend:"
ls -la backend/src/controllers/payment.controller.js 2>/dev/null && echo "  ✅ payment.controller.js" || echo "  ❌ payment.controller.js manquant"
ls -la backend/src/models/Payment.js 2>/dev/null && echo "  ✅ Payment.js" || echo "  ❌ Payment.js manquant"
ls -la backend/src/routes/payment.routes.js 2>/dev/null && echo "  ✅ payment.routes.js" || echo "  ❌ payment.routes.js manquant"
ls -la backend/src/middleware/upload.js 2>/dev/null && echo "  ✅ upload.js" || echo "  ❌ upload.js manquant"
ls -la backend/sql/005_add_manual_payment_fields.sql 2>/dev/null && echo "  ✅ migration 005" || echo "  ❌ migration 005 manquante"

echo ""
echo "Frontend:"
ls -la src/pages/AdminPayments.tsx 2>/dev/null && echo "  ✅ AdminPayments.tsx" || echo "  ❌ AdminPayments.tsx manquant"
ls -la src/components/payment/ManualPaymentModal.tsx 2>/dev/null && echo "  ✅ ManualPaymentModal.tsx" || echo "  ❌ ManualPaymentModal.tsx manquant"

echo ""
echo "Uploads:"
ls -la backend/uploads/ 2>/dev/null && echo "  ✅ Dossier uploads existe" || echo "  ❌ Dossier uploads manquant"
ls -la backend/uploads/payments/ 2>/dev/null && echo "  ✅ Dossier payments existe" || echo "  ❌ Dossier payments manquant"
echo ""

echo "🗃️  4. Vérification de la base de données"
echo "------------------------------------------------"
echo "Structure de la table payments:"
sudo mysql arch_excellence -e "DESCRIBE payments;" 2>/dev/null || echo "❌ Erreur accès BDD"
echo ""

echo "Vérification des nouvelles colonnes:"
sudo mysql arch_excellence -e "
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME IN ('payment_proof_path', 'transaction_reference', 'rejection_reason', 'validated_by', 'validated_at')
ORDER BY COLUMN_NAME;
" 2>/dev/null || echo "❌ Erreur requête BDD"
echo ""

echo "Vérification ENUM payment_method:"
sudo mysql arch_excellence -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'payment_method';
" 2>/dev/null
echo ""

echo "Vérification ENUM status:"
sudo mysql arch_excellence -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'status';
" 2>/dev/null
echo ""

echo "Vérification ENUM payment_status (companies):"
sudo mysql arch_excellence -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
    AND TABLE_NAME = 'companies' 
    AND COLUMN_NAME = 'payment_status';
" 2>/dev/null
echo ""

echo "Vérification des index:"
sudo mysql arch_excellence -e "
SHOW INDEX FROM payments 
WHERE Key_name IN ('idx_payment_status', 'idx_payment_company', 'idx_payment_user', 'idx_payment_validated_by');
" 2>/dev/null
echo ""

echo "🔧 5. Vérification du backend (PM2)"
echo "------------------------------------------------"
pm2 status
echo ""

echo "Vérification du processus:"
pm2 info arch-excellence-api 2>/dev/null || echo "❌ Processus arch-excellence-api non trouvé"
echo ""

echo "📋 6. Derniers logs backend (20 lignes)"
echo "------------------------------------------------"
pm2 logs arch-excellence-api --lines 20 --nostream 2>/dev/null | tail -30
echo ""

echo "🚨 7. Recherche d'erreurs récentes"
echo "------------------------------------------------"
echo "Erreurs dans les logs:"
pm2 logs arch-excellence-api --err --lines 10 --nostream 2>/dev/null | tail -15
echo ""

echo "🌐 8. Vérification Nginx"
echo "------------------------------------------------"
sudo systemctl status nginx | grep -E "Active|Loaded|Main PID"
echo ""

echo "Test configuration Nginx:"
sudo nginx -t 2>&1
echo ""

echo "📦 9. Vérification des dépendances backend"
echo "------------------------------------------------"
cd /var/www/mock-data-creator/backend
echo "Package multer installé:"
npm list multer 2>/dev/null | grep multer || echo "❌ multer non installé"
echo ""

echo "🎨 10. Vérification du build frontend"
echo "------------------------------------------------"
cd /var/www/mock-data-creator
if [ -d "dist" ]; then
    echo "✅ Dossier dist existe"
    echo "Taille du build:"
    du -sh dist/
    echo ""
    echo "Fichiers principaux:"
    ls -lh dist/index.html 2>/dev/null && echo "  ✅ index.html" || echo "  ❌ index.html manquant"
    ls -lh dist/assets/*.js 2>/dev/null | head -3
else
    echo "❌ Dossier dist n'existe pas - Frontend non buildé"
fi
echo ""

echo "🔍 11. Test de connectivité API"
echo "------------------------------------------------"
echo "Test endpoint de santé (si disponible):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/health 2>/dev/null || echo "Note: Endpoint health non configuré (normal)"
echo ""

echo "🔐 12. Vérification des permissions"
echo "------------------------------------------------"
echo "Permissions uploads:"
ls -ld backend/uploads/
ls -ld backend/uploads/payments/
echo ""

echo "Propriétaire des fichiers:"
ls -l backend/uploads/ | head -5
echo ""

echo "📊 13. Statistiques de la base de données"
echo "------------------------------------------------"
echo "Nombre total de paiements:"
sudo mysql arch_excellence -e "SELECT COUNT(*) as total_payments FROM payments;" 2>/dev/null
echo ""

echo "Paiements par statut:"
sudo mysql arch_excellence -e "
SELECT status, COUNT(*) as count 
FROM payments 
GROUP BY status 
ORDER BY count DESC;
" 2>/dev/null
echo ""

echo "Paiements en attente (pending):"
sudo mysql arch_excellence -e "
SELECT COUNT(*) as pending_payments 
FROM payments 
WHERE status = 'pending' AND payment_method = 'manual_transfer';
" 2>/dev/null
echo ""

echo "Entreprises par statut de paiement:"
sudo mysql arch_excellence -e "
SELECT payment_status, COUNT(*) as count 
FROM companies 
GROUP BY payment_status 
ORDER BY count DESC;
" 2>/dev/null
echo ""

echo "💾 14. Espace disque"
echo "------------------------------------------------"
df -h /var/www/mock-data-creator
echo ""
echo "Taille du dossier uploads:"
du -sh /var/www/mock-data-creator/backend/uploads/ 2>/dev/null || echo "Dossier vide ou inexistant"
echo ""

echo "🧪 15. Variables d'environnement"
echo "------------------------------------------------"
cd /var/www/mock-data-creator/backend
if [ -f .env ]; then
    echo "✅ Fichier .env existe"
    echo "Vérification des variables clés (sans valeurs sensibles):"
    grep -E "^(NODE_ENV|PORT|DB_HOST|DB_NAME|JWT_SECRET)" .env | sed 's/=.*/=***/' || echo "Variables non trouvées"
else
    echo "❌ Fichier .env manquant"
fi
echo ""

echo "=========================================="
echo "✅ VÉRIFICATION TERMINÉE"
echo "=========================================="
echo ""
echo "📝 Résumé rapide:"
echo "  - Git: $(cd /var/www/mock-data-creator && git log -1 --oneline)"
echo "  - PM2: $(pm2 list | grep arch-excellence-api | awk '{print $10}')"
echo "  - Nginx: $(sudo systemctl is-active nginx)"
echo "  - Uploads: $([ -d /var/www/mock-data-creator/backend/uploads/payments ] && echo 'OK' || echo 'MANQUANT')"
echo ""
echo "🎯 Prochaines actions suggérées:"
echo "  1. Si OK → Tester l'application sur http://31.220.82.109"
echo "  2. Si problèmes → Consulter les logs détaillés ci-dessus"
echo "  3. Tester le workflow complet (création entreprise → paiement → validation)"
echo ""

ENDSSH

echo ""
echo "🌐 Test de connectivité externe"
echo "------------------------------------------------"
echo "Test page d'accueil:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://31.220.82.109

echo ""
echo "Test API externe:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://31.220.82.109/api/health 2>/dev/null || echo "Note: Test API (peut être normal si pas d'endpoint health)"

echo ""
echo "=========================================="
echo "✅ VÉRIFICATION COMPLÈTE TERMINÉE"
echo "=========================================="
