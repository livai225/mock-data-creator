# 💳 Système de Paiement Manuel - Documentation Complète

## 📋 Vue d'ensemble

Ce système permet aux clients de soumettre une preuve de paiement (capture d'écran) après avoir effectué un dépôt via Mobile Money. Un administrateur peut ensuite valider ou rejeter le paiement.

## 🎯 Fonctionnalités

### Pour le Client

1. **Tentative de téléchargement de documents**
   - Si non payé → Modal de paiement s'affiche automatiquement
   - Si paiement en attente → Message "En cours de vérification"
   - Si payé → Téléchargement autorisé

2. **Soumission du paiement**
   - Affichage des numéros de dépôt (MTN, Orange, Moov, Wave)
   - Copie rapide des numéros
   - Saisie de la référence de transaction
   - Upload d'une capture d'écran (max 5MB)
   - Statut de l'entreprise passe à "pending"

3. **Notifications**
   - Confirmation de soumission
   - Message clair sur l'attente de validation (24h max)

### Pour l'Administrateur

1. **Page de gestion** (`/admin/paiements`)
   - Liste de tous les paiements en attente
   - Informations client et entreprise
   - Montant et référence de transaction
   - Prévisualisation de la preuve de paiement

2. **Actions possibles**
   - **Valider** : Le paiement passe à "completed", l'entreprise à "paid"
   - **Rejeter** : Le paiement passe à "rejected", l'entreprise à "unpaid"
     - Saisie obligatoire d'une raison
     - Client notifié par email (à implémenter)

3. **Filtres et recherche**
   - Affichage par statut
   - Recherche par client/entreprise
   - Actualisation en temps réel

## 🗂️ Structure des fichiers modifiés/créés

### Backend

```
backend/
├── sql/
│   └── 005_add_manual_payment_fields.sql      # Migration SQL
├── src/
│   ├── models/
│   │   └── Payment.js                         # Modèle mis à jour
│   ├── controllers/
│   │   └── payment.controller.js              # Nouvelles fonctions
│   ├── routes/
│   │   └── payment.routes.js                  # Nouvelles routes
│   └── middleware/
│       └── upload.js                          # Gestion upload (existant)
└── uploads/
    └── payments/                              # Dossier pour les captures
```

### Frontend

```
src/
├── pages/
│   ├── ClientDashboard.tsx                    # Intégration du modal
│   └── AdminPayments.tsx                      # Nouvelle page admin
├── components/
│   └── payment/
│       └── ManualPaymentModal.tsx             # Modal de paiement
├── admin/
│   └── AdminLayout.tsx                        # Ajout lien menu
├── lib/
│   └── api.ts                                 # Nouvelles fonctions API
└── App.tsx                                    # Nouvelle route
```

## 🔧 Modifications de la base de données

### Table `payments`

Nouvelles colonnes ajoutées :
- `payment_proof_path` : Chemin vers la capture
- `transaction_reference` : Référence de la transaction
- `rejection_reason` : Raison du rejet (si applicable)
- `validated_by` : ID de l'admin qui a validé
- `validated_at` : Date de validation

### Statuts

**payment_method** (ENUM) :
- `card`
- `mobile_money`
- `bank_transfer`
- `cash`
- **`manual_transfer`** ← NOUVEAU

**status** (ENUM) :
- `pending`
- `completed`
- `failed`
- `cancelled`
- `refunded`
- **`rejected`** ← NOUVEAU

**payment_status** dans `companies` (ENUM) :
- `unpaid`
- **`pending`** ← NOUVEAU
- `paid`
- `refunded`

## 📡 API Endpoints

### Client

```http
POST /api/payments/submit-manual
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- company_id: number
- amount: number
- transaction_reference: string
- payment_proof: File (image)

Response:
{
  "success": true,
  "message": "Preuve de paiement soumise avec succès...",
  "data": {
    "payment": { ... }
  }
}
```

### Admin

```http
# Obtenir les paiements en attente
GET /api/payments/admin/pending?limit=50
Authorization: Bearer {token}

# Valider un paiement
PUT /api/payments/:id/validate
Authorization: Bearer {token}
Body: { "notes": "Paiement validé" }

# Rejeter un paiement
PUT /api/payments/:id/reject
Authorization: Bearer {token}
Body: { "reason": "Montant incorrect" }
```

## 🚀 Déploiement

### Option 1 : Script automatique

```bash
chmod +x deploy-payment-system.sh
./deploy-payment-system.sh
```

### Option 2 : Étapes manuelles

#### 1. Push du code

```bash
git add .
git commit -m "Implémentation système de paiement manuel"
git push origin main
```

#### 2. Sur le serveur

```bash
# Connexion SSH
ssh hexpertise@vmi2967615.contaboserver.net

# Naviguer vers le projet
cd /var/www/mock-data-creator

# Pull du code
git pull origin main

# Migration SQL
sudo mysql arch_excellence < backend/sql/005_add_manual_payment_fields.sql

# Créer le dossier uploads
mkdir -p backend/uploads/payments
chmod 755 backend/uploads/payments

# Backend : installer dépendances et redémarrer
cd backend
npm install
pm2 restart arch-excellence-api

# Frontend : build et déployer
cd ..
npm run build
sudo systemctl reload nginx
```

## 🧪 Tests à effectuer

### 1. Test Client

1. Créer une entreprise (sans payer)
2. Essayer de télécharger un document
3. Le modal de paiement doit s'afficher
4. Remplir :
   - Référence de transaction
   - Upload d'une capture
5. Cliquer sur "Valider le paiement"
6. Vérifier le message de confirmation
7. Essayer de télécharger à nouveau
8. Doit afficher "En cours de vérification"

### 2. Test Admin

1. Se connecter en tant qu'admin
2. Aller sur `/admin/paiements`
3. Vérifier que le paiement apparaît dans la liste
4. Cliquer sur "Voir la capture"
5. Vérifier que l'image s'affiche correctement
6. Cliquer sur "Valider"
7. Vérifier que le paiement disparaît de la liste

### 3. Test Client après validation

1. Retour sur le dashboard client
2. Actualiser la page
3. Le statut de l'entreprise doit être "Payé"
4. Cliquer sur le bouton de téléchargement
5. Le document doit se télécharger sans modal

### 4. Test de rejet

1. Soumettre un nouveau paiement
2. En tant qu'admin, cliquer sur "Rejeter"
3. Saisir une raison
4. Valider
5. Côté client, le statut doit repasser à "Non payé"
6. Le modal de paiement doit s'afficher à nouveau

## 🎨 Configuration des numéros de dépôt

Les numéros s'affichent dans le modal de paiement. Pour les modifier :

**Fichier** : `src/components/payment/ManualPaymentModal.tsx`

```typescript
const depositNumbers = [
  { operator: "MTN Mobile Money", number: "07 XX XX XX XX", color: "text-yellow-600" },
  { operator: "Orange Money", number: "07 XX XX XX XX", color: "text-orange-600" },
  { operator: "Moov Money", number: "01 XX XX XX XX", color: "text-blue-600" },
  { operator: "Wave", number: "07 XX XX XX XX", color: "text-pink-600" },
];
```

**⚠️ Important** : Remplacer les `XX` par les vrais numéros avant la mise en production !

## 📧 Notifications par email (à implémenter)

Le système est prêt pour l'envoi d'emails, il suffit d'ajouter :

### Quand envoyer ?

1. **Client soumet un paiement** → Email de confirmation
2. **Admin valide** → Email "Paiement validé, documents disponibles"
3. **Admin rejette** → Email "Paiement rejeté : {raison}"

### Où ajouter le code ?

**Backend** : `backend/src/controllers/payment.controller.js`

Dans les fonctions :
- `submitManualPayment` (ligne ~105)
- `validateManualPayment` (ligne ~145)
- `rejectManualPayment` (ligne ~175)

Exemple :

```javascript
// Après la validation
await sendEmail({
  to: user.email,
  subject: "Paiement validé",
  html: `Votre paiement de ${amount} FCFA a été validé...`
});
```

## 🔒 Sécurité

### Implémenté

- ✅ Upload limité aux images uniquement
- ✅ Taille max 5MB
- ✅ Authentification JWT requise
- ✅ Vérification propriété entreprise
- ✅ Admin only pour validation/rejet
- ✅ Chemins d'upload sécurisés

### À ajouter (optionnel)

- 🔄 Rate limiting sur l'upload
- 🔄 Scan antivirus des fichiers
- 🔄 Watermark sur les captures
- 🔄 Audit log des actions admin

## 📊 Monitoring

### Logs à surveiller

```bash
# Logs backend
pm2 logs arch-excellence-api

# Logs spécifiques aux paiements
pm2 logs arch-excellence-api | grep -i payment

# Erreurs seulement
pm2 logs arch-excellence-api --err
```

### Métriques à suivre

1. Nombre de paiements soumis par jour
2. Temps moyen de validation
3. Taux de rejet
4. Paiements en attente > 24h

## 🐛 Résolution des problèmes

### Le modal ne s'affiche pas

1. Vérifier que `checkPaymentBeforeAction` est appelé
2. Vérifier le statut de paiement dans la BDD
3. Vérifier les logs console (F12)

### L'image ne s'affiche pas dans l'admin

1. Vérifier que le dossier `uploads/payments` existe
2. Vérifier les permissions (755)
3. Vérifier le chemin dans `payment_proof_path`
4. Vérifier la configuration Nginx pour servir les fichiers statiques

### Erreur 413 (Payload too large)

Augmenter la limite dans Nginx :

```nginx
client_max_body_size 10M;
```

### Erreur "Cannot find module errorHandler"

Créer le fichier sur le serveur :

```bash
nano backend/src/utils/errorHandler.js
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

## 📱 Mobile-Friendly

Le modal est optimisé pour mobile :
- Responsive design
- Boutons larges et cliquables
- Upload photo depuis la caméra
- Scroll adaptatif

## 🎯 Améliorations futures

1. **Notifications push** (websockets)
2. **Export Excel** des paiements
3. **Dashboard statistiques** paiements
4. **Validation automatique** via API Mobile Money
5. **Scan QR Code** pour les numéros
6. **Historique des paiements** pour le client
7. **Multi-devises** (USD, EUR, etc.)

## 👥 Support

En cas de problème :
1. Consulter les logs PM2
2. Vérifier la migration SQL
3. Tester en local d'abord
4. Contacter le développeur

---

**Date de création** : 2 janvier 2026  
**Version** : 1.0.0  
**Auteur** : Architecture d'Excellence
