# 🚀 Déploiement Rapide - Système de Paiement Manuel

## ✅ Ce qui a été fait

### Backend
- ✅ Migration SQL (ajout colonnes pour paiement manuel)
- ✅ Modèle Payment mis à jour (nouvelles méthodes)
- ✅ Contrôleur Payment (4 nouvelles fonctions)
- ✅ Routes API (endpoints pour client et admin)
- ✅ Middleware upload (déjà existant, compatible)

### Frontend
- ✅ Modal de paiement manuel (`ManualPaymentModal.tsx`)
- ✅ Page admin paiements (`AdminPayments.tsx`)
- ✅ Intégration dans ClientDashboard
- ✅ Fonctions API (`api.ts`)
- ✅ Route et menu admin

---

## 🎯 Étapes de déploiement

### 1️⃣ Commit et Push (LOCAL)

```bash
git add .
git commit -m "Feat: Système de paiement manuel complet avec validation admin"
git push origin main
```

### 2️⃣ Connexion au serveur

```bash
ssh hexpertise@vmi2967615.contaboserver.net
```

### 3️⃣ Pull du code

```bash
cd /var/www/mock-data-creator
git pull origin main
```

### 4️⃣ Migration SQL

```bash
sudo mysql arch_excellence << 'EOF'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_path VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_by INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_at DATETIME;

ALTER TABLE payments MODIFY COLUMN payment_method ENUM('card', 'mobile_money', 'bank_transfer', 'cash', 'manual_transfer') NOT NULL;
ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded', 'rejected') DEFAULT 'pending';
ALTER TABLE companies MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid';

CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_validated_by ON payments(validated_by);

SELECT '✅ Migration terminée!' as Status;
EOF
```

### 5️⃣ Créer le dossier uploads

```bash
cd /var/www/mock-data-creator/backend
mkdir -p uploads/payments
chmod 755 uploads
chmod 755 uploads/payments
ls -la uploads/
```

### 6️⃣ Installer les dépendances backend

```bash
cd /var/www/mock-data-creator/backend
npm install
```

### 7️⃣ Redémarrer le backend

```bash
pm2 restart arch-excellence-api
pm2 status
```

### 8️⃣ Build et déployer le frontend

```bash
cd /var/www/mock-data-creator
npm run build
sudo systemctl reload nginx
```

### 9️⃣ Vérifier les logs

```bash
pm2 logs arch-excellence-api --lines 20
```

---

## 🧪 Tests

### Test Client (http://31.220.82.109)

1. Connexion avec un compte client
2. Créer une entreprise
3. Aller sur "Mes Documents"
4. Cliquer sur "Télécharger"
5. ➡️ Le modal de paiement doit s'afficher
6. Remplir la référence et uploader une capture
7. Valider
8. ➡️ Message "En cours de vérification"

### Test Admin (http://31.220.82.109/admin/paiements)

1. Connexion avec compte admin
2. Aller dans le menu "Paiements"
3. ➡️ Le paiement soumis doit apparaître
4. Cliquer sur "Voir la capture"
5. ➡️ L'image doit s'afficher
6. Valider le paiement
7. ➡️ Le paiement disparaît de la liste

### Vérification finale

1. Retour sur le dashboard client
2. Actualiser
3. ➡️ Statut "Payé"
4. Télécharger le document
5. ➡️ Téléchargement direct, sans modal

---

## 🔧 Configuration des numéros

**IMPORTANT** : Modifier les numéros de dépôt !

**Fichier** : `src/components/payment/ManualPaymentModal.tsx`  
**Ligne** : ~47-52

Remplacer les `XX` par les vrais numéros :

```typescript
const depositNumbers = [
  { operator: "MTN Mobile Money", number: "07 XX XX XX XX", color: "text-yellow-600" },
  { operator: "Orange Money", number: "07 XX XX XX XX", color: "text-orange-600" },
  { operator: "Moov Money", number: "01 XX XX XX XX", color: "text-blue-600" },
  { operator: "Wave", number: "07 XX XX XX XX", color: "text-pink-600" },
];
```

Puis rebuild et redéployer :

```bash
# Sur le serveur
cd /var/www/mock-data-creator
# Modifier le fichier
nano src/components/payment/ManualPaymentModal.tsx
# Rebuild
npm run build
sudo systemctl reload nginx
```

---

## 🐛 Problèmes courants

### Erreur "Cannot find module errorHandler"

```bash
# Sur le serveur
nano /var/www/mock-data-creator/backend/src/utils/errorHandler.js
```

Contenu :

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Image ne s'affiche pas

```bash
# Vérifier les permissions
ls -la /var/www/mock-data-creator/backend/uploads/
chmod 755 /var/www/mock-data-creator/backend/uploads/payments
```

### Build frontend échoue

```bash
# Sur le serveur
cd /var/www/mock-data-creator
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Commandes utiles

```bash
# Voir les logs en temps réel
pm2 logs arch-excellence-api

# Voir le statut
pm2 status

# Redémarrer le backend
pm2 restart arch-excellence-api

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier les paiements en BDD
sudo mysql arch_excellence -e "SELECT id, payment_reference, status, payment_method FROM payments ORDER BY created_at DESC LIMIT 10;"
```

---

## 📝 Checklist finale

- [ ] Code committé et pushé
- [ ] Pull effectué sur le serveur
- [ ] Migration SQL appliquée
- [ ] Dossier uploads créé avec permissions
- [ ] Backend redémarré
- [ ] Frontend rebuildé
- [ ] Nginx rechargé
- [ ] Test client effectué
- [ ] Test admin effectué
- [ ] Numéros de dépôt configurés
- [ ] Logs vérifiés (pas d'erreur)

---

## 🎉 C'est prêt !

Le système de paiement manuel est maintenant opérationnel. Les clients peuvent soumettre leurs preuves de paiement et les admins peuvent les valider/rejeter.

**Documentation complète** : Voir `SYSTEME_PAIEMENT_MANUEL_COMPLET.md`
