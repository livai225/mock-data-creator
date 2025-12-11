# 🚀 Configuration avec Laragon

Guide rapide pour configurer ARCH EXCELLENCE avec Laragon.

## ✅ Configuration actuelle

- **Base de données** : `arch`
- **Utilisateur MySQL** : `admin`
- **Mot de passe** : (vide)
- **Port MySQL** : 3306

## 📋 Étapes d'installation

### 1. Vérifier que Laragon est démarré

Assurez-vous que Laragon est lancé et que MySQL est actif.

### 2. Importer le schéma de base de données

Ouvrez **HeidiSQL** (inclus dans Laragon) ou utilisez la ligne de commande :

#### Option A : Via HeidiSQL
1. Ouvrir HeidiSQL depuis Laragon
2. Se connecter avec l'utilisateur `admin` (sans mot de passe)
3. Sélectionner la base de données `arch`
4. Aller dans **Fichier > Exécuter un fichier SQL**
5. Sélectionner : `database/schema-laragon.sql`
6. Cliquer sur **Exécuter**

#### Option B : Via ligne de commande
```bash
# Depuis le dossier racine du projet
cd database
mysql -u admin arch < schema-laragon.sql
```

### 3. Configurer le backend

```bash
cd backend

# Copier le fichier de configuration Laragon
copy .env.laragon .env

# Installer les dépendances
npm install
```

### 4. Vérifier la configuration

Le fichier `.env` doit contenir :

```env
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=
DB_NAME=arch
DB_PORT=3306
```

### 5. Démarrer le backend

```bash
npm run dev
```

Vous devriez voir :
```
✅ Connexion MySQL établie avec succès
🚀 Serveur démarré sur le port 5000
```

### 6. Démarrer le frontend

Dans un autre terminal :

```bash
# Retour à la racine
cd ..

# Démarrer le frontend (si pas déjà fait)
npm run dev
```

## 🧪 Tester l'API

### Test de connexion à la base de données

```bash
# Ouvrir http://localhost:5000/health dans le navigateur
```

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "ARCH EXCELLENCE API is running",
  "timestamp": "2024-12-10T21:20:00.000Z"
}
```

### Test de connexion admin

Utilisez un outil comme **Postman** ou **Thunder Client** :

**POST** `http://localhost:5000/api/auth/login`

Body (JSON) :
```json
{
  "email": "admin@archexcellence.ci",
  "password": "Admin@123456"
}
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@archexcellence.ci",
      "firstName": "Admin",
      "lastName": "ARCH EXCELLENCE",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📊 Vérifier les tables créées

Dans HeidiSQL ou via ligne de commande :

```sql
USE arch;
SHOW TABLES;
```

Vous devriez voir 8 tables :
- users
- companies
- associates
- documents
- payments
- activity_logs
- notifications
- settings

## 🔧 Dépannage

### Erreur : "Access denied for user 'admin'"

Vérifiez que l'utilisateur `admin` existe dans MySQL :

```sql
-- Dans HeidiSQL ou ligne de commande MySQL
SELECT User, Host FROM mysql.user WHERE User = 'admin';
```

Si l'utilisateur n'existe pas, créez-le :

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON arch.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

### Erreur : "Unknown database 'arch'"

Créez la base de données :

```sql
CREATE DATABASE arch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Port 5000 déjà utilisé

Modifiez le port dans `.env` :

```env
PORT=5001
API_URL=http://localhost:5001
```

Et redémarrez le serveur.

### Erreur de connexion MySQL

Vérifiez que MySQL est bien démarré dans Laragon :
1. Ouvrir Laragon
2. Cliquer sur **Démarrer tout**
3. Vérifier que MySQL est vert (actif)

## 📝 Données de test (optionnel)

Pour charger des données de test :

```bash
cd database
mysql -u admin arch < seed.sql
```

Cela créera :
- 3 utilisateurs de test
- 3 entreprises exemples
- Notifications
- Logs d'activité

**Utilisateurs de test** :
- john.doe@example.com / Test@123456
- marie.kouame@example.com / Test@123456
- pierre.yao@example.com / Test@123456

## ✅ Checklist

- [ ] Laragon démarré
- [ ] Base de données `arch` créée
- [ ] Schéma SQL importé
- [ ] Fichier `.env` configuré
- [ ] Dépendances backend installées
- [ ] Backend démarré (port 5000)
- [ ] Frontend démarré (port 8080)
- [ ] Test de connexion admin réussi

## 🎉 C'est prêt !

Votre application est maintenant configurée avec Laragon !

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:5000
- **HeidiSQL** : Accessible depuis Laragon

Bon développement ! 🚀
