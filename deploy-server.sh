#!/bin/bash
# Script de déploiement sur le serveur distant

echo "🚀 Déploiement des modifications sur le serveur..."
echo ""

# 1. Aller dans le répertoire du projet
cd /var/www/mock-data-creator

# 2. Récupérer les dernières modifications depuis Git
echo "📥 Récupération des modifications depuis GitHub..."
git pull origin main

# 3. Aller dans le dossier backend
cd backend

# 4. Redémarrer l'application PM2
echo "🔄 Redémarrage du backend..."
pm2 delete arch-excellence-api
pm2 start src/server.js --name arch-excellence-api
pm2 save

# 5. Revenir au répertoire racine
cd ..

# 6. Reconstruire le frontend
echo "🏗️  Reconstruction du frontend..."
npm run build

# 7. Recharger Nginx
echo "🔄 Rechargement de Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📍 Vérifications :"
echo "   - Backend: http://localhost:5000/health"
echo "   - Frontend: http://31.220.82.109"
echo ""
echo "💡 Pour vérifier les logs :"
echo "   pm2 logs arch-excellence-api --lines 50"

