# 🔍 Commandes de Vérification du Serveur

## 🚀 Option 1 : Script automatique complet

```bash
chmod +x verify-server.sh
./verify-server.sh
```

## ⚡ Option 2 : Vérification rapide (2 minutes)

```bash
chmod +x quick-check.sh
./quick-check.sh
```

---

## 📋 Option 3 : Commandes individuelles

### 1️⃣ Connexion SSH

```bash
ssh hexpertise@vmi2967615.contaboserver.net
```

### 2️⃣ Vérifier la version Git

```bash
cd /var/www/mock-data-creator
git log -1 --oneline
git status
```

**✅ Attendu** : Commit "Feat: Système de paiement manuel..."

---

### 3️⃣ Vérifier les fichiers backend

```bash
cd /var/www/mock-data-creator

# Contrôleur payment
ls -lh backend/src/controllers/payment.controller.js

# Modèle Payment
ls -lh backend/src/models/Payment.js

# Routes payment
ls -lh backend/src/routes/payment.routes.js

# Middleware upload
ls -lh backend/src/middleware/upload.js

# Migration SQL
ls -lh backend/sql/005_add_manual_payment_fields.sql
```

**✅ Attendu** : Tous les fichiers existent

---

### 4️⃣ Vérifier les fichiers frontend

```bash
# Page admin
ls -lh src/pages/AdminPayments.tsx

# Modal paiement
ls -lh src/components/payment/ManualPaymentModal.tsx

# Build frontend
ls -lh dist/index.html
```

**✅ Attendu** : Tous les fichiers existent

---

### 5️⃣ Vérifier le dossier uploads

```bash
ls -la backend/uploads/
ls -la backend/uploads/payments/
```

**✅ Attendu** : Les deux dossiers existent avec permissions 755

**Si manquant** :
```bash
mkdir -p backend/uploads/payments
chmod 755 backend/uploads/payments
```

---

### 6️⃣ Vérifier la base de données

```bash
# Vérifier les nouvelles colonnes
sudo mysql arch_excellence -e "DESCRIBE payments;"
```

**✅ Attendu** : Les colonnes suivantes doivent apparaître :
- `payment_proof_path`
- `transaction_reference`
- `rejection_reason`
- `validated_by`
- `validated_at`

```bash
# Vérifier les ENUM
sudo mysql arch_excellence -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'arch_excellence' 
  AND TABLE_NAME = 'payments' 
  AND COLUMN_NAME = 'payment_method';
"
```

**✅ Attendu** : Doit contenir `'manual_transfer'`

```bash
# Vérifier les index
sudo mysql arch_excellence -e "SHOW INDEX FROM payments;"
```

**✅ Attendu** : Index `idx_payment_status`, `idx_payment_company`, etc.

---

### 7️⃣ Vérifier le backend (PM2)

```bash
pm2 status
```

**✅ Attendu** : `arch-excellence-api` en status `online`

```bash
# Voir les logs
pm2 logs arch-excellence-api --lines 20
```

**✅ Attendu** : Pas d'erreur "Cannot find module"

```bash
# Voir uniquement les erreurs
pm2 logs arch-excellence-api --err --lines 10
```

**✅ Attendu** : Pas d'erreur critique

---

### 8️⃣ Vérifier Nginx

```bash
sudo systemctl status nginx
```

**✅ Attendu** : `active (running)`

```bash
# Test configuration
sudo nginx -t
```

**✅ Attendu** : `test is successful`

---

### 9️⃣ Vérifier les dépendances

```bash
cd /var/www/mock-data-creator/backend
npm list multer
```

**✅ Attendu** : `multer@1.x.x`

---

### 🔟 Tests de la base de données

```bash
# Nombre total de paiements
sudo mysql arch_excellence -e "SELECT COUNT(*) as total_payments FROM payments;"

# Paiements par statut
sudo mysql arch_excellence -e "
SELECT status, COUNT(*) as count 
FROM payments 
GROUP BY status;
"

# Paiements en attente
sudo mysql arch_excellence -e "
SELECT COUNT(*) as pending 
FROM payments 
WHERE status = 'pending' AND payment_method = 'manual_transfer';
"

# Entreprises par statut
sudo mysql arch_excellence -e "
SELECT payment_status, COUNT(*) as count 
FROM companies 
GROUP BY payment_status;
"
```

---

## 🧪 Tests fonctionnels

### Test 1 : API Backend

```bash
# Depuis le serveur
curl -I http://localhost:3000/api/companies
```

**✅ Attendu** : `HTTP/1.1 401` (normal sans token)

### Test 2 : Frontend

```bash
# Depuis votre machine locale
curl -I http://31.220.82.109
```

**✅ Attendu** : `HTTP/1.1 200 OK`

### Test 3 : Page Admin Paiements

Ouvrir dans le navigateur :
```
http://31.220.82.109/admin/paiements
```

**✅ Attendu** : Page se charge (login si non connecté)

---

## 🐛 Résolution des problèmes

### Problème : Fichier manquant

```bash
cd /var/www/mock-data-creator
git pull origin main
```

### Problème : Migration non appliquée

```bash
sudo mysql arch_excellence < backend/sql/005_add_manual_payment_fields.sql
```

### Problème : Dossier uploads manquant

```bash
mkdir -p backend/uploads/payments
chmod 755 backend/uploads
chmod 755 backend/uploads/payments
```

### Problème : Backend ne démarre pas

```bash
cd /var/www/mock-data-creator/backend
npm install
pm2 restart arch-excellence-api
pm2 logs arch-excellence-api
```

### Problème : Frontend non buildé

```bash
cd /var/www/mock-data-creator
npm install
npm run build
sudo systemctl reload nginx
```

### Problème : Erreur "Cannot find module errorHandler"

```bash
cat > /var/www/mock-data-creator/backend/src/utils/errorHandler.js << 'EOF'
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
EOF

pm2 restart arch-excellence-api
```

---

## ✅ Checklist rapide

Depuis le serveur (`ssh hexpertise@vmi2967615.contaboserver.net`) :

```bash
cd /var/www/mock-data-creator

echo "1. Git:" && git log -1 --oneline
echo "2. PM2:" && pm2 list | grep arch-excellence-api
echo "3. Nginx:" && sudo systemctl is-active nginx
echo "4. Uploads:" && ls -ld backend/uploads/payments
echo "5. Migration:" && sudo mysql arch_excellence -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='payments' AND COLUMN_NAME='payment_proof_path';"
echo "6. Frontend:" && ls -lh dist/index.html
echo "7. Dernière erreur:" && pm2 logs arch-excellence-api --err --lines 1 --nostream
```

**✅ Si tout est OK** : Tous les tests passent

**❌ Si problème** : Consulter les logs et la section "Résolution des problèmes"

---

## 🎯 Test workflow complet

### Depuis votre navigateur

1. **Page d'accueil** : http://31.220.82.109
   - ✅ Page se charge

2. **Connexion** : http://31.220.82.109/connexion
   - ✅ Formulaire de connexion s'affiche

3. **Dashboard client** : http://31.220.82.109/dashboard
   - ✅ Liste des entreprises (si connecté)

4. **Admin paiements** : http://31.220.82.109/admin/paiements
   - ✅ Page admin (si admin)

---

## 📊 Monitoring continu

Pour surveiller en temps réel :

```bash
# Terminal 1 : Logs backend
pm2 logs arch-excellence-api

# Terminal 2 : Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Terminal 3 : Espace disque
watch -n 30 'df -h /var/www/mock-data-creator'
```

---

## 🆘 En cas de problème

1. **Vérifier les logs** : `pm2 logs arch-excellence-api --err`
2. **Redémarrer PM2** : `pm2 restart arch-excellence-api`
3. **Recharger Nginx** : `sudo systemctl reload nginx`
4. **Pull le code** : `git pull origin main`
5. **Réappliquer la migration** : Voir section "Résolution des problèmes"

---

**Dernière mise à jour** : 2 janvier 2026
