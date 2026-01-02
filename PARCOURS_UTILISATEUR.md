# 📋 Parcours Utilisateur - Création d'Entreprise

## 🎯 Vue d'ensemble

Ce document décrit le parcours complet d'un **nouvel utilisateur** qui souhaite créer son entreprise sur la plateforme ARCH EXCELLENCE.

---

## 🚀 Scénario 1 : Utilisateur NON connecté

### Étape 1 : Arrivée sur le site (Page d'accueil `/`)

**Ce que voit l'utilisateur :**
- Hero section avec titre "Créez votre entreprise en Côte d'Ivoire en quelques clics"
- Bouton principal : **"Créer mon entreprise"** → Redirige vers `/creation-entreprise`
- Bouton secondaire : "Découvrir nos services"
- Statistiques (nombre d'entreprises créées, etc.)
- Section des avantages (Rapide, Conforme, Disponible 24/7, Expert dédié)
- Liste des types de sociétés disponibles avec leurs prix

**Action utilisateur :** Clique sur "Créer mon entreprise"

---

### Étape 2 : Page de création d'entreprise (`/creation-entreprise`)

#### 2.1 Sélection du type de société

**Ce que voit l'utilisateur :**
- Liste des types de sociétés disponibles :
  - SARL Unipersonnelle (SARLU)
  - SARL Pluripersonnelle
  - EI (Entreprise Individuelle)
  - SNC, SCS, GIE, SA, SAS, COOPERATIVE
- Pour chaque type : nom, description, prix, temps estimé

**Action utilisateur :** Clique sur un type de société

**Comportement système :**
1. Affiche une **dialog** avec la checklist des documents à préparer
2. L'utilisateur peut :
   - Fermer la dialog
   - Continuer vers le formulaire

**Action utilisateur :** Clique sur "Continuer"

---

#### 2.2 Remplissage du formulaire

**💡 Indicateur visuel recommandé :**
- Afficher un **badge ou bandeau permanent** en haut du formulaire indiquant :
  - Le type de société en cours de création (ex: "SARL Unipersonnelle", "SARL Pluripersonnelle")
  - Le prix associé
  - Possibilité de revenir en arrière pour changer de type
- Cet indicateur reste visible pendant toute la saisie du formulaire
- Design suggéré : Badge coloré en haut à gauche ou bandeau sticky en haut de page

**Selon le type de société choisi :**

**A. SARL Unipersonnelle (SARLU) :**
- Formulaire dédié avec :
  - Informations de l'entreprise (nom, activité, capital, adresse, ville)
  - Informations du gérant (nom, prénom, date de naissance, lieu de naissance, nationalité, CNI, etc.)
  - Informations de contact (email, téléphone)
- Bouton "Générer les documents" → Redirige vers `/preview-documents`

**B. SARL Pluripersonnelle :**
- Formulaire dédié avec :
  - Informations de l'entreprise
  - Liste des associés (nom, parts, etc.)
  - Informations du gérant
  - Informations de contact
- Bouton "Générer les documents" → Redirige vers `/preview-documents`

**C. Autres types :**
- Formulaire standard avec informations de base

**Action utilisateur :** Remplit le formulaire et clique sur "Générer les documents"

**Comportement système :**
- **Si utilisateur NON connecté :**
  1. Sauvegarde les données dans `sessionStorage` avec la clé `"pending_company_creation"`
  2. Affiche un toast : "Veuillez créer un compte pour récupérer vos documents"
  3. Redirige vers `/inscription` avec `redirectTo: "/dashboard"`

---

### Étape 3 : Inscription (`/inscription`)

**Ce que voit l'utilisateur :**
- Formulaire d'inscription :
  - Email
  - Mot de passe (min 8 caractères, majuscule, minuscule, chiffre)
  - Confirmation du mot de passe
- Bouton "Créer mon compte"
- Lien "Déjà un compte ? Se connecter"

**Action utilisateur :** Remplit le formulaire et clique sur "Créer mon compte"

**Comportement système :**
1. Appel API `POST /api/auth/register`
2. Si succès :
   - Token JWT sauvegardé dans `localStorage` (clé `"arch_excellence_token"`)
   - Utilisateur connecté automatiquement
   - Redirige vers `/dashboard`

---

### Étape 4 : Dashboard (`/dashboard`) - Traitement automatique

**Comportement système automatique :**
1. Le composant `ClientDashboard` détecte `pending_company_creation` dans `sessionStorage`
2. Appel API `POST /api/companies` pour créer l'entreprise
3. Récupération de l'ID de l'entreprise créée
4. Appel API `POST /api/documents/generate` avec :
   - `companyId` : ID de l'entreprise
   - `docs` : Liste des documents à générer
   - `formats` : `['pdf', 'docx']`
5. Suppression de `pending_company_creation` du `sessionStorage`
6. Rechargement des données (entreprises + documents)

**Ce que voit l'utilisateur :**
- Toast : "Finalisation de la création de votre entreprise..."
- Puis : "Entreprise créée avec succès !"
- Dashboard avec :
  - Section "Mes Entreprises" : Liste des entreprises créées
  - Section "Mes Documents" : Liste des documents générés (PDF et Word)

---

## ✅ Scénario 2 : Utilisateur DÉJÀ connecté

### Étape 1 : Arrivée sur le site

**Comportement système :**
- Si token présent dans `localStorage`, utilisateur automatiquement connecté
- Peut accéder directement à `/creation-entreprise`

---

### Étape 2 : Création d'entreprise

**Même processus que Scénario 1, mais :**

**Action utilisateur :** Remplit le formulaire et clique sur "Générer les documents"

**Comportement système :**
- **Si utilisateur connecté :**
  1. Appel API `POST /api/companies` pour créer l'entreprise
  2. Récupération de l'ID de l'entreprise
  3. Appel API `POST /api/documents/generate` avec `companyId`
  4. Redirige vers `/dashboard` (ou `/preview-documents` selon le type)

---

### Étape 3 : Prévisualisation des documents (`/preview-documents`)

**⚠️ Note :** Cette page est accessible via les formulaires SARLU et SARL Pluripersonnelle

**Ce que voit l'utilisateur :**
- Liste des documents à vérifier (sidebar gauche)
- Aperçu du document sélectionné (zone principale)
- Boutons :
  - "Valider ce document"
  - "Valider et suivant"
  - "Valider tous les documents"

**Action utilisateur :** Valide tous les documents

**Comportement système :**
1. Si utilisateur non connecté → Redirige vers `/inscription`
2. Si utilisateur connecté :
   - Appel API `POST /api/companies` pour créer l'entreprise
   - Appel API `POST /api/documents/generate` avec `companyId` et `formats: ['pdf', 'docx']`
   - Génération des documents en PDF et Word
   - Affichage des PDF générés dans des iframes
   - L'utilisateur reste sur la page de prévisualisation

**Ce que voit l'utilisateur :**
- Les documents PDF générés s'affichent dans des iframes
- Peut prévisualiser, télécharger, ou retourner au dashboard

---

## 📊 Flux de données

### 1. Création d'entreprise

```
Frontend → POST /api/companies
Body: {
  companyType: "SARLU",
  companyName: "...",
  activity: "...",
  capital: 1000000,
  address: "...",
  city: "Abidjan",
  gerant: "...",
  associates: [...],
  paymentAmount: 50000
}

Backend → Crée l'entreprise dans MySQL
→ Retourne: { success: true, data: { id: 123, ... } }
```

### 2. Génération de documents

```
Frontend → POST /api/documents/generate
Body: {
  companyId: 123,
  docs: ["Statuts SARL", "DSV", "Liste des gérants"],
  formats: ["pdf", "docx"]
}

Backend → 
  1. Récupère les données de l'entreprise (company, associates, managers)
  2. Génère le contenu pour chaque document via documentTemplates.js
  3. Crée les fichiers PDF (pdfkit) et Word (docx)
  4. Sauvegarde dans backend/generated/
  5. Enregistre dans la table documents
  6. Retourne: { success: true, data: [{ id, docName, fileName, ... }] }
```

### 3. Récupération des documents

```
Frontend → GET /api/documents/my?t=timestamp

Backend → 
  1. Nettoie les documents orphelins (liés à entreprise supprimée)
  2. Retourne les documents valides de l'utilisateur
  3. Retourne: { success: true, data: [{ id, doc_name, file_name, ... }] }
```

---

## 🔐 Authentification

### Inscription
- **Route :** `POST /api/auth/register`
- **Body :** `{ email, password }`
- **Validation :**
  - Email valide
  - Mot de passe : min 8 caractères, majuscule, minuscule, chiffre
- **Retour :** `{ success: true, data: { user, token } }`

### Connexion
- **Route :** `POST /api/auth/login`
- **Body :** `{ email, password }`
- **Retour :** `{ success: true, data: { user, token } }`

### Protection des routes
- Toutes les routes `/api/companies/*` et `/api/documents/*` nécessitent un token JWT
- Middleware `protect` vérifie le token et injecte `req.user`

---

## 📁 Structure des données

### Table `companies`
- `id`, `user_id`, `company_type`, `company_name`, `activity`, `capital`, `address`, `city`, `gerant`, `payment_amount`, `status` (draft/pending/processing/completed/rejected), `created_at`

### Table `associates`
- `id`, `company_id`, `name`, `parts`, `capital_contribution`, etc.

### Table `managers`
- `id`, `company_id`, `first_name`, `last_name`, `birth_date`, `birth_place`, `nationality`, `cni_number`, etc.

### Table `documents`
- `id`, `user_id`, `company_id`, `doc_type`, `doc_name`, `file_name`, `file_path`, `mime_type`, `created_at`

---

## 🎨 Points d'attention

### 1. Gestion des utilisateurs non connectés
- Les données sont sauvegardées dans `sessionStorage`
- Après inscription/connexion, traitement automatique dans le dashboard

### 2. Génération de documents
- Les documents sont générés en **PDF et Word** simultanément
- Stockage physique dans `backend/generated/`
- Enregistrement en base de données avec `company_id` pour liaison

### 3. Nettoyage automatique
- Lors de la récupération des documents, nettoyage automatique des documents orphelins
- Suppression en cascade lors de la suppression d'une entreprise

### 4. Cache-busting
- Ajout d'un timestamp dans l'URL de l'API pour forcer le rechargement

---

## 🐛 Cas d'erreur

### Erreur lors de la création d'entreprise
- Toast d'erreur affiché
- L'utilisateur reste sur le formulaire
- Peut réessayer

### Erreur lors de la génération de documents
- Toast d'erreur affiché
- L'entreprise est créée mais les documents ne sont pas générés
- L'utilisateur peut regénérer depuis le dashboard

### Token expiré
- Redirection automatique vers `/connexion`
- Perte des données en session si non sauvegardées

---

## 📝 Résumé du parcours

```
1. Arrivée sur le site
   ↓
2. Clic "Créer mon entreprise"
   ↓
3. Sélection du type de société
   ↓
4. Remplissage du formulaire
   ↓
5a. Si NON connecté → Inscription → Dashboard (traitement auto)
5b. Si connecté → Génération directe → Dashboard ou Preview
   ↓
6. Dashboard : Visualisation entreprises + documents
   ↓
7. Actions possibles :
   - Prévisualiser un document
   - Télécharger un document (PDF ou Word)
   - Supprimer une entreprise (et ses documents)
```

---

## 🔄 Améliorations possibles

1. **Indicateur du type de société** : Badge/bandeau permanent rappelant le type de société en cours de création (⚠️ **Prioritaire** - problème UX identifié)
2. **Sauvegarde automatique** du formulaire pendant la saisie
3. **Édition** d'une entreprise existante
4. **Regénération** de documents avec nouvelles données
5. **Historique** des modifications
6. **Notifications** par email lors de la génération de documents
7. **Paiement en ligne** intégré avant génération

