#!/bin/bash

echo "=========================================="
echo "🔍 VÉRIFICATION DU SERVEUR ARCH EXCELLENCE"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier PM2 (Backend)
echo "1️⃣  Vérification PM2 (Backend)..."
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
    pm2 logs arch-excellence-api --lines 10 --nostream
else
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
fi
echo ""

# 2. Vérifier Nginx
echo "2️⃣  Vérification Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx est actif${NC}"
    systemctl status nginx --no-pager -l | head -10
else
    echo -e "${RED}❌ Nginx n'est pas actif${NC}"
fi
echo ""

# 3. Vérifier MySQL
echo "3️⃣  Vérification MySQL..."
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL est actif${NC}"
    systemctl status mysql --no-pager -l | head -10
else
    echo -e "${RED}❌ MySQL n'est pas actif${NC}"
fi
echo ""

# 4. Vérifier les ports
echo "4️⃣  Vérification des ports en écoute..."
echo "Port 80 (HTTP):"
if netstat -tuln | grep -q ':80 '; then
    echo -e "${GREEN}✅ Port 80 ouvert${NC}"
else
    echo -e "${RED}❌ Port 80 fermé${NC}"
fi

echo "Port 443 (HTTPS):"
if netstat -tuln | grep -q ':443 '; then
    echo -e "${GREEN}✅ Port 443 ouvert${NC}"
else
    echo -e "${YELLOW}⚠️  Port 443 fermé (SSL peut ne pas être configuré)${NC}"
fi

echo "Port 5000 (Backend API):"
if netstat -tuln | grep -q ':5000 '; then
    echo -e "${GREEN}✅ Port 5000 ouvert${NC}"
else
    echo -e "${RED}❌ Port 5000 fermé${NC}"
fi
echo ""

# 5. Vérifier l'espace disque
echo "5️⃣  Espace disque disponible..."
df -h / | tail -1
echo ""

# 6. Vérifier la connexion à la base de données
echo "6️⃣  Test de connexion à la base de données..."
if [ -f ~/mock-data-creator/backend/.env ]; then
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
    DB_NAME=$(grep DB_NAME ~/mock-data-creator/backend/.env | cut -d '=' -f2)
    if [ ! -z "$DB_NAME" ]; then
        echo "Base de données: $DB_NAME"
        mysql -e "USE $DB_NAME; SELECT COUNT(*) as total_companies FROM companies;" 2>/dev/null && echo -e "${GREEN}✅ Connexion DB OK${NC}" || echo -e "${RED}❌ Erreur de connexion DB${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
fi
echo ""

# 7. Vérifier les fichiers du projet
echo "7️⃣  Vérification des fichiers du projet..."
PROJECT_DIR="$HOME/mock-data-creator"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire projet trouvé: $PROJECT_DIR${NC}"
    
    # Vérifier backend
    if [ -d "$PROJECT_DIR/backend" ]; then
        echo -e "${GREEN}✅ Backend présent${NC}"
        if [ -f "$PROJECT_DIR/backend/src/server.js" ]; then
            echo -e "${GREEN}✅ server.js présent${NC}"
        else
            echo -e "${RED}❌ server.js manquant${NC}"
        fi
    else
        echo -e "${RED}❌ Backend manquant${NC}"
    fi
    
    # Vérifier frontend build
    if [ -d "$PROJECT_DIR/dist" ]; then
        echo -e "${GREEN}✅ Frontend build présent${NC}"
        FILE_COUNT=$(find "$PROJECT_DIR/dist" -type f | wc -l)
        echo "   Fichiers dans dist/: $FILE_COUNT"
    else
        echo -e "${YELLOW}⚠️  Frontend build manquant (dist/)${NC}"
    fi
else
    echo -e "${RED}❌ Répertoire projet non trouvé${NC}"
fi
echo ""

# 8. Vérifier les logs récents
echo "8️⃣  Logs récents Nginx (erreurs)..."
if [ -f /var/log/nginx/error.log ]; then
    echo "Dernières erreurs Nginx:"
    tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Aucune erreur récente"
else
    echo -e "${YELLOW}⚠️  Fichier de log Nginx non trouvé${NC}"
fi
echo ""

# 9. Vérifier SSL
echo "9️⃣  Vérification SSL..."
if [ -d "/etc/letsencrypt/live" ]; then
    echo -e "${GREEN}✅ Certificats Let's Encrypt trouvés${NC}"
    ls -la /etc/letsencrypt/live/ 2>/dev/null | head -5
else
    echo -e "${YELLOW}⚠️  Certificats SSL non trouvés${NC}"
fi
echo ""

# 10. Test de santé API
echo "🔟 Test de santé de l'API..."
API_URL="http://localhost:5000"
if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API répond correctement${NC}"
    curl -s "$API_URL/health" | head -3
else
    echo -e "${RED}❌ API ne répond pas${NC}"
fi
echo ""

echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="

