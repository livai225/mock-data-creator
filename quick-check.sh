#!/bin/bash

# Vérification rapide du serveur
echo "🔍 VÉRIFICATION RAPIDE..."

ssh hexpertise@vmi2967615.contaboserver.net << 'EOF'
cd /var/www/mock-data-creator

echo "✅ Git: $(git log -1 --oneline)"
echo "✅ PM2: $(pm2 list | grep arch-excellence-api | awk '{print $2, $10, $16}')"
echo "✅ Nginx: $(sudo systemctl is-active nginx)"
echo "✅ Uploads: $([ -d backend/uploads/payments ] && echo 'OK' || echo 'MANQUANT')"

echo ""
echo "📊 Base de données:"
sudo mysql arch_excellence -e "SELECT COUNT(*) as total FROM payments;" 2>/dev/null | tail -1
sudo mysql arch_excellence -e "SELECT COUNT(*) as pending FROM payments WHERE status = 'pending';" 2>/dev/null | tail -1

echo ""
echo "🔍 Nouveaux fichiers:"
ls -lh backend/src/middleware/upload.js 2>/dev/null | awk '{print $9, $5}' || echo "❌ upload.js"
ls -lh src/pages/AdminPayments.tsx 2>/dev/null | awk '{print $9, $5}' || echo "❌ AdminPayments.tsx"
ls -lh src/components/payment/ManualPaymentModal.tsx 2>/dev/null | awk '{print $9, $5}' || echo "❌ ManualPaymentModal.tsx"

echo ""
echo "🚨 Dernières erreurs:"
pm2 logs arch-excellence-api --err --lines 5 --nostream 2>/dev/null | grep -i error | tail -3 || echo "Aucune erreur récente"

EOF

echo ""
echo "🌐 Test externe: $(curl -s -o /dev/null -w '%{http_code}' http://31.220.82.109)"
echo ""
