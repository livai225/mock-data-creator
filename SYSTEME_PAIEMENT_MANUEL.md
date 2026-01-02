# 💰 Système de Paiement Manuel avec Preuve de Dépôt

## 🎯 Objectif

Permettre aux clients de payer manuellement par Mobile Money et de soumettre une preuve de paiement (capture d'écran) qui sera validée par l'administrateur avant de débloquer le téléchargement des documents.

## 🔄 Flux complet

### 1️⃣ **Côté Client**

1. Le client remplit le formulaire et génère les documents
2. Les documents sont créés mais **bloqués** (pas de téléchargement possible)
3. Un bouton **"Payer pour télécharger"** s'affiche
4. En cliquant, une popup s'ouvre avec :
   - Le montant à payer
   - Les numéros Mobile Money (MTN, Orange, Moov, Wave)
   - Un champ pour entrer la référence de transaction
   - Un bouton pour uploader la capture du reçu
5. Le client :
   - Fait son dépôt vers un des numéros
   - Entre la référence de transaction
   - Upload la capture d'écran du reçu
   - Clique sur "Valider"
6. Statut passe à **"En attente de validation"**
7. Message affiché : "Votre paiement est en cours de vérification. Vous recevrez une notification une fois validé."

### 2️⃣ **Côté Admin**

1. L'admin voit dans son tableau de bord les paiements en attente
2. Pour chaque paiement :
   - Nom du client
   - Montant
   - Référence de transaction
   - **Capture du reçu** (visualisation)
   - Date de soumission
3. L'admin peut :
   - ✅ **Valider** le paiement → Documents débloqués pour le client
   - ❌ **Rejeter** le paiement → Client notifié avec raison du rejet

### 3️⃣ **Après Validation**

1. Statut du paiement passe à **"Validé"**
2. `payment_status` de l'entreprise passe à **"paid"**
3. Le client peut maintenant **télécharger** tous ses documents
4. Email de confirmation envoyé au client

## 📁 Fichiers à créer/modifier

### Frontend

#### ✅ Créés :
1. **`src/components/payment/ManualPaymentModal.tsx`**
   - Modal de paiement manuel
   - Upload de capture
   - Formulaire de soumission

#### 🔄 À modifier :
2. **`src/pages/ClientDashboard.tsx`**
   - Bloquer téléchargement si `payment_status !== 'paid'`
   - Afficher bouton "Payer" si non payé
   - Afficher statut du paiement

3. **`src/lib/api.ts`**
   - Ajouter `submitManualPaymentApi()`

### Backend

#### 🔄 À créer/modifier :
4. **`backend/src/controllers/payment.controller.js`**
   - Ajouter `submitManualPayment()` - Soumission avec upload
   - Ajouter `validateManualPayment()` - Validation par admin
   - Ajouter `rejectManualPayment()` - Rejet par admin

5. **`backend/src/routes/payment.routes.js`**
   - POST `/api/payments/submit-manual` - Soumettre paiement
   - PUT `/api/payments/:id/validate` - Valider (admin)
   - PUT `/api/payments/:id/reject` - Rejeter (admin)

6. **`backend/src/models/Payment.js`**
   - Ajouter champ `payment_proof_path`
   - Ajouter champ `transaction_reference`
   - Ajouter méthode `getPendingPayments()`

### Base de données

#### Migration SQL :
```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_path VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_by INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_at DATETIME;

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_company ON payments(company_id);
```

## 🎨 Interface Admin - Gestion des Paiements

### Page : `/admin/paiements`

**Tableau des paiements en attente :**

| Client | Entreprise | Montant | Référence | Capture | Date | Actions |
|--------|------------|---------|-----------|---------|------|---------|
| John Doe | ABC SARL | 50,000 FCFA | MP231225.1234 | [Voir] | 01/01/2026 | ✅ Valider / ❌ Rejeter |

**Modal de visualisation de la capture :**
- Affichage plein écran de la capture
- Zoom possible
- Informations du paiement à côté

## 🔐 Sécurité

✅ **Vérifications :**
- Fichier image uniquement (JPG, PNG, GIF, PDF)
- Taille max 5MB
- Vérification que l'entreprise appartient au client
- Seul l'admin peut valider/rejeter
- Logs de toutes les actions

## 📧 Notifications Email

### Email après soumission :
```
Objet : Paiement en cours de vérification

Bonjour [Nom],

Nous avons bien reçu votre preuve de paiement pour l'entreprise [Nom Entreprise].

Montant : [Montant] FCFA
Référence : [Référence]

Votre paiement sera vérifié sous 24h maximum.
Vous recevrez un email de confirmation dès validation.

Cordialement,
L'équipe ARCH EXCELLENCE
```

### Email après validation :
```
Objet : ✅ Paiement validé - Documents disponibles

Bonjour [Nom],

Excellente nouvelle ! Votre paiement a été validé.

Vous pouvez maintenant télécharger tous vos documents depuis votre tableau de bord :
[Lien vers dashboard]

Merci de votre confiance !

Cordialement,
L'équipe ARCH EXCELLENCE
```

### Email après rejet :
```
Objet : ❌ Paiement non validé

Bonjour [Nom],

Malheureusement, nous n'avons pas pu valider votre paiement.

Raison : [Raison du rejet]

Veuillez soumettre à nouveau une preuve de paiement valide.

Pour toute question, contactez-nous : support@archexcellence.ci

Cordialement,
L'équipe ARCH EXCELLENCE
```

## 🚀 Prochaines étapes d'implémentation

1. ✅ Modal de paiement manuel créé
2. ⏳ API backend pour soumission
3. ⏳ Page admin de gestion des paiements
4. ⏳ Système de notifications email
5. ⏳ Blocage des téléchargements si non payé
6. ⏳ Tests complets

---

**Voulez-vous que je continue l'implémentation ?** 🚀
