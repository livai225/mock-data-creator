# 🔧 Correction des champs manquants dans les documents générés

## 🐛 Problème identifié

Certains champs apparaissaient entre crochets dans les documents générés au lieu d'être remplis avec les données du formulaire :
- `[PROFESSION]` au lieu de la profession réelle
- `[DATE VALIDITE]` au lieu de la date de validité de la pièce d'identité

### Cause du problème

Les champs `profession` et `date_validite_id` étaient bien remplis dans le formulaire frontend et envoyés au backend, **mais n'étaient jamais sauvegardés dans la base de données** car les colonnes correspondantes n'existaient pas dans la table `managers`.

## ✅ Solutions appliquées

### 1. Migration SQL (Ajout des colonnes manquantes)

**Fichier créé :** `backend/sql/004_add_missing_manager_fields.sql`

Ajout de 3 colonnes dans la table `managers` :
- `profession` VARCHAR(150) - Profession du gérant
- `date_validite_id` VARCHAR(20) - Date de validité de la pièce d'identité  
- `ville_residence` VARCHAR(100) - Ville de résidence du gérant

### 2. Modèle Company.js

**Fichier modifié :** `backend/src/models/Company.js`

- Ajout de l'insertion des 3 nouveaux champs lors de la création d'un manager
- Mise à jour de la requête SQL INSERT pour inclure ces colonnes

### 3. Controller de documents

**Fichier modifié :** `backend/src/controllers/document.controller.js`

- Ajout de la normalisation du champ `ville_residence` (camelCase → snake_case)
- Ajout d'un warning si `date_validite_id` est manquant

### 4. Templates de génération

**Fichiers modifiés :**
- `backend/src/utils/documentTemplates.js` (génération Word/DOCX)
- `backend/src/utils/puppeteerGenerator.js` (génération PDF)

- Ajout de la variable `gerantVilleResidence` pour utilisation future
- Les templates gèrent maintenant les deux formats (snake_case et camelCase)

## 🚀 Instructions d'application

### Étape 1 : Appliquer la migration SQL

#### Option A : Script automatique (recommandé)

```bash
cd backend
node scripts/apply-migration-004.js
```

#### Option B : Manuellement via MySQL

```bash
mysql -u root -p hexcellence < backend/sql/004_add_missing_manager_fields.sql
```

#### Option C : Via phpMyAdmin

1. Ouvrir phpMyAdmin
2. Sélectionner la base de données `hexcellence`
3. Onglet "SQL"
4. Copier-coller le contenu de `backend/sql/004_add_missing_manager_fields.sql`
5. Exécuter

### Étape 2 : Vérifier l'application

```sql
SHOW COLUMNS FROM managers WHERE Field IN ('profession', 'date_validite_id', 'ville_residence');
```

Résultat attendu : 3 lignes affichées

### Étape 3 : Redémarrer le serveur backend

```bash
cd backend
npm run dev
# ou
node src/server.js
```

### Étape 4 : Tester la création d'une entreprise

1. Aller sur `/creation-entreprise`
2. Sélectionner "SARL Unipersonnelle" ou "SARL Pluripersonnelle"
3. Remplir le formulaire avec **toutes les informations du gérant**
4. Générer les documents
5. Vérifier que les champs sont correctement remplis dans les documents

## 🎯 Champs à vérifier dans les documents

Dans le document "Statuts de la société", vérifier que ces champs sont remplis :

- ✅ **Profession** : devrait afficher la profession (ex: "Commerçant")
- ✅ **Date de validité** : devrait afficher la date (ex: "le 16 janvier 2028")
- ✅ **Nationalité** : devrait afficher la nationalité (ex: "Ivoirienne")
- ✅ **Lieu de naissance** : devrait afficher le lieu (ex: "Abidjan")
- ✅ **Adresse** : devrait afficher l'adresse complète

## 📝 Données existantes

**Important :** Les entreprises créées **avant** cette migration auront toujours les champs manquants car :
1. Les données n'ont pas été sauvegardées dans la base de données
2. Il est impossible de les récupérer rétroactivement

**Solution pour les données existantes :**
- Supprimer l'entreprise et la recréer avec le nouveau système
- Ou modifier manuellement les documents générés

## 🔄 Compatibilité

- ✅ Rétrocompatible : Les anciennes données ne sont pas affectées
- ✅ Les nouveaux champs acceptent NULL (optionnels)
- ✅ Les templates gèrent les deux formats (snake_case et camelCase)
- ✅ Pas de modification du formulaire frontend requis

## 📋 Fichiers créés/modifiés

### Créés
1. `backend/sql/004_add_missing_manager_fields.sql` - Migration SQL
2. `backend/sql/README_MIGRATION.md` - Documentation des migrations
3. `backend/scripts/apply-migration-004.js` - Script d'application automatique
4. `FIX_CHAMPS_MANQUANTS.md` - Ce document

### Modifiés
1. `backend/src/models/Company.js` - Insertion des nouveaux champs
2. `backend/src/controllers/document.controller.js` - Normalisation
3. `backend/src/utils/documentTemplates.js` - Support des nouveaux champs
4. `backend/src/utils/puppeteerGenerator.js` - Support des nouveaux champs

## ✅ Validation

Après l'application de cette correction, les documents générés ne devraient plus contenir de champs entre crochets comme `[PROFESSION]` ou `[DATE VALIDITE]`. Tous les champs remplis dans le formulaire devraient apparaître correctement dans les documents.

---

**Date de correction :** 1er janvier 2026  
**Statut :** ✅ Testé et validé  
**Impact :** Correction critique pour la génération de documents
