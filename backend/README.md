# ARCH EXCELLENCE - Backend API

API REST pour la plateforme de création d'entreprises en Côte d'Ivoire.

## 🚀 Technologies

- **Node.js** v18+
- **Express.js** - Framework web
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **PDFKit** - Génération de PDF

## 📋 Prérequis

- Node.js 18+ installé
- MySQL 8+ installé et configuré
- npm ou yarn

## 🛠️ Installation locale

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos configurations :

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=arch_excellence
JWT_SECRET=votre_secret_jwt_tres_securise
```

### 3. Créer la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter le script SQL
source ../database/schema.sql
```

Ou directement :

```bash
mysql -u root -p < ../database/schema.sql
```

### 4. Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (database, etc.)
│   ├── controllers/     # Contrôleurs (logique métier)
│   ├── middleware/      # Middlewares (auth, validation, etc.)
│   ├── models/          # Modèles de données
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires
│   └── server.js        # Point d'entrée
├── uploads/             # Fichiers uploadés
├── generated/           # PDFs générés
├── .env                 # Variables d'environnement
├── .env.example         # Exemple de configuration
└── package.json
```

## 🔐 API Endpoints

### Authentification (`/api/auth`)

- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /me` - Profil utilisateur
- `PUT /profile` - Mise à jour profil
- `PUT /change-password` - Changer mot de passe

### Entreprises (`/api/companies`)

- `POST /` - Créer une entreprise
- `GET /` - Liste des entreprises de l'utilisateur
- `GET /:id` - Détails d'une entreprise
- `PUT /:id` - Modifier une entreprise
- `POST /:id/submit` - Soumettre pour traitement
- `DELETE /:id` - Supprimer une entreprise
- `GET /stats/me` - Statistiques utilisateur

### Admin (`/api/admin`)

- `GET /dashboard` - Dashboard admin
- `GET /users` - Liste des utilisateurs
- `GET /companies` - Liste des entreprises
- `GET /stats` - Statistiques détaillées
- `PUT /companies/:id/status` - Modifier statut entreprise
- `PUT /users/:id/toggle-status` - Activer/désactiver utilisateur
- `DELETE /users/:id` - Supprimer utilisateur

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Rate limiting
- Helmet.js pour les headers de sécurité
- Validation des données avec express-validator
- Protection CORS

## 🧪 Tests

```bash
npm test
```

## 📦 Déploiement

Voir le fichier `DEPLOYMENT.md` pour les instructions de déploiement sur VPS Contabo.

## 👤 Compte Admin par défaut

**Email**: admin@archexcellence.ci  
**Mot de passe**: Admin@123456

⚠️ **IMPORTANT**: Changez ce mot de passe en production !

## 📝 License

MIT
