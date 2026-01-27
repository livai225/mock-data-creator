#!/bin/bash
# =============================================================================
# Script de vérification santé du backend - Arch Excellence
# Usage: bash check-backend-health.sh
# =============================================================================

echo "=============================================="
echo "🔍 VÉRIFICATION SANTÉ BACKEND - ARCH EXCELLENCE"
echo "=============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Vérifier que PM2 tourne
echo "1️⃣  Vérification PM2..."
if pm2 status arch-excellence-api | grep -q "online"; then
    echo -e "   ${GREEN}✅ PM2: arch-excellence-api est ONLINE${NC}"
else
    echo -e "   ${RED}❌ PM2: arch-excellence-api n'est PAS online${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Vérifier que le port 5000 répond
echo "2️⃣  Vérification API (port 5000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null | grep -q "200\|404"; then
    echo -e "   ${GREEN}✅ API: Le serveur répond sur le port 5000${NC}"
else
    echo -e "   ${RED}❌ API: Le serveur ne répond pas sur le port 5000${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Vérifier les modules critiques
echo "3️⃣  Vérification modules Node.js..."
cd /var/www/mock-data-creator/backend

# Test puppeteerGenerator
echo "   📦 Test puppeteerGenerator.js..."
RESULT=$(node -e "import('./src/utils/puppeteerGenerator.js').then(m => console.log('OK')).catch(e => console.error('ERREUR:', e.message))" 2>&1)
if echo "$RESULT" | grep -q "OK"; then
    echo -e "   ${GREEN}✅ puppeteerGenerator.js: Chargement OK${NC}"
else
    echo -e "   ${RED}❌ puppeteerGenerator.js: $RESULT${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test cepiciPdfOverlay
echo "   📦 Test cepiciPdfOverlay.js..."
RESULT=$(node -e "import('./src/utils/cepiciPdfOverlay.js').then(m => console.log('OK')).catch(e => console.error('ERREUR:', e.message))" 2>&1)
if echo "$RESULT" | grep -q "OK"; then
    echo -e "   ${GREEN}✅ cepiciPdfOverlay.js: Chargement OK${NC}"
else
    echo -e "   ${RED}❌ cepiciPdfOverlay.js: $RESULT${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test documentGenerator
echo "   📦 Test documentGenerator.js..."
RESULT=$(node -e "import('./src/utils/documentGenerator.js').then(m => console.log('OK')).catch(e => console.error('ERREUR:', e.message))" 2>&1)
if echo "$RESULT" | grep -q "OK"; then
    echo -e "   ${GREEN}✅ documentGenerator.js: Chargement OK${NC}"
else
    echo -e "   ${RED}❌ documentGenerator.js: $RESULT${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test modelBasedGenerator
echo "   📦 Test modelBasedGenerator.js..."
RESULT=$(node -e "import('./src/utils/modelBasedGenerator.js').then(m => console.log('OK')).catch(e => console.error('ERREUR:', e.message))" 2>&1)
if echo "$RESULT" | grep -q "OK"; then
    echo -e "   ${GREEN}✅ modelBasedGenerator.js: Chargement OK${NC}"
else
    echo -e "   ${RED}❌ modelBasedGenerator.js: $RESULT${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Vérifier les dépendances critiques
echo "4️⃣  Vérification dépendances npm..."
cd /var/www/mock-data-creator/backend

if [ -d "node_modules/pdf-lib" ]; then
    echo -e "   ${GREEN}✅ pdf-lib: Installé${NC}"
else
    echo -e "   ${RED}❌ pdf-lib: NON installé${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "node_modules/puppeteer" ]; then
    echo -e "   ${GREEN}✅ puppeteer: Installé${NC}"
else
    echo -e "   ${RED}❌ puppeteer: NON installé${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Vérifier les modèles PDF
echo "5️⃣  Vérification modèles PDF (CEPICI)..."
cd /var/www/mock-data-creator

if [ -f "models_ecriture/SARL UNIPERSONNELLE/formulaire-unique.pdf" ]; then
    echo -e "   ${GREEN}✅ Modèle CEPICI SARLU: Présent${NC}"
else
    echo -e "   ${RED}❌ Modèle CEPICI SARLU: MANQUANT${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "models_ecriture/SARL PLURIPERSONEL/formulaire-unique HYDRA FOR.pdf" ]; then
    echo -e "   ${GREEN}✅ Modèle CEPICI SARL Pluri: Présent${NC}"
else
    echo -e "   ${RED}❌ Modèle CEPICI SARL Pluri: MANQUANT${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Vérifier le dossier generated
echo "6️⃣  Vérification dossier generated..."
cd /var/www/mock-data-creator/backend

if [ -d "generated" ]; then
    echo -e "   ${GREEN}✅ Dossier generated: Existe${NC}"
    PERMS=$(stat -c "%a" generated 2>/dev/null || stat -f "%OLp" generated 2>/dev/null)
    echo "   📁 Permissions: $PERMS"
else
    echo -e "   ${YELLOW}⚠️  Dossier generated: N'existe pas (sera créé automatiquement)${NC}"
fi
echo ""

# 7. Vérifier MySQL
echo "7️⃣  Vérification connexion MySQL..."
if mysql -u root -e "SELECT 1" arch_excellence >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ MySQL: Connexion OK${NC}"
else
    echo -e "   ${YELLOW}⚠️  MySQL: Impossible de tester (vérifiez manuellement)${NC}"
fi
echo ""

# 8. Vérifier les erreurs récentes dans les logs
echo "8️⃣  Dernières erreurs dans les logs PM2..."
RECENT_ERRORS=$(pm2 logs arch-excellence-api --lines 50 --nostream 2>/dev/null | grep -i "error\|erreur\|❌" | tail -5)
if [ -z "$RECENT_ERRORS" ]; then
    echo -e "   ${GREEN}✅ Pas d'erreurs récentes dans les logs${NC}"
else
    echo -e "   ${YELLOW}⚠️  Erreurs récentes trouvées:${NC}"
    echo "$RECENT_ERRORS" | head -5
fi
echo ""

# 9. Vérifier Nginx
echo "9️⃣  Vérification Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "   ${GREEN}✅ Nginx: Actif${NC}"
else
    echo -e "   ${RED}❌ Nginx: Inactif${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Résumé
echo "=============================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUT EST OK ! Le backend est prêt.${NC}"
else
    echo -e "${RED}❌ $ERRORS ERREUR(S) DÉTECTÉE(S)${NC}"
    echo "   Corrigez les erreurs ci-dessus avant de continuer."
fi
echo "=============================================="
