# Migrations SQL - Instructions

## Comment appliquer les migrations

### Migration 004 - Ajout des champs manquants dans managers

**Fichier:** `004_add_missing_manager_fields.sql`

**Date:** 2026-01-01

**Description:** Cette migration ajoute les colonnes manquantes dans la table `managers` :
- `profession` : Profession du gérant
- `date_validite_id` : Date de validité de la pièce d'identité
- `ville_residence` : Ville de résidence du gérant

### Méthode 1 : Via MySQL command line

```bash
# Se connecter à MySQL
mysql -u root -p hexcellence

# Exécuter la migration
source /chemin/vers/backend/sql/004_add_missing_manager_fields.sql;

# Vérifier que les colonnes ont été ajoutées
DESCRIBE managers;
```

### Méthode 2 : Via phpMyAdmin (Laragon)

1. Ouvrir phpMyAdmin
2. Sélectionner la base de données `hexcellence`
3. Aller dans l'onglet "SQL"
4. Copier-coller le contenu du fichier `004_add_missing_manager_fields.sql`
5. Cliquer sur "Exécuter"

### Méthode 3 : Via un script Node.js

```bash
cd backend
node -e "const fs = require('fs'); const mysql = require('mysql2/promise'); (async () => { const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'hexcellence' }); const sql = fs.readFileSync('./sql/004_add_missing_manager_fields.sql', 'utf8'); await connection.query(sql); console.log('✅ Migration 004 appliquée avec succès'); await connection.end(); })();"
```

## Vérification

Après avoir appliqué la migration, vérifier que les colonnes existent :

```sql
SHOW COLUMNS FROM managers WHERE Field IN ('profession', 'date_validite_id', 'ville_residence');
```

Résultat attendu :
```
+------------------+--------------+------+-----+---------+-------+
| Field            | Type         | Null | Key | Default | Extra |
+------------------+--------------+------+-----+---------+-------+
| profession       | varchar(150) | YES  |     | NULL    |       |
| date_validite_id | varchar(20)  | YES  |     | NULL    |       |
| ville_residence  | varchar(100) | YES  |     | NULL    |       |
+------------------+--------------+------+-----+---------+-------+
```

## Impact

Cette migration corrige le problème où les champs `[PROFESSION]` et `[DATE VALIDITE]` apparaissaient entre crochets dans les documents générés au lieu d'être remplis avec les données du formulaire.

**Fichiers modifiés :**
- `backend/src/models/Company.js` - Ajout des nouveaux champs lors de l'insertion
- `backend/src/controllers/document.controller.js` - Normalisation des champs
- `backend/src/utils/documentTemplates.js` - Support des nouveaux champs
- `backend/src/utils/puppeteerGenerator.js` - Support des nouveaux champs

**Compatibilité :** Cette migration est rétrocompatible. Les anciennes données ne sont pas affectées.
