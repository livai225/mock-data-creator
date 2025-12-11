# 🏢 ARCH EXCELLENCE - Plateforme de Création d'Entreprises

Plateforme complète de génération automatique de documents administratifs pour la création d'entreprises en Côte d'Ivoire.

## 📋 Description

ARCH EXCELLENCE est une solution full-stack permettant aux entrepreneurs de créer leur entreprise en ligne avec génération automatique de tous les documents conformes CEPICI et OHADA.

### Fonctionnalités principales

- ✅ **Inscription/Connexion** avec authentification JWT
- ✅ **Création d'entreprises** (SARL, EI, SNC, SCS, GIE)
- ✅ **Génération automatique de documents** (Statuts, DSV, etc.)
- ✅ **Dashboard utilisateur** pour suivre ses entreprises
- ✅ **Dashboard admin** pour gérer les demandes
- ✅ **Système de paiement** intégré
- ✅ **Notifications** en temps réel

## 🛠️ Technologies

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **React Router** - Navigation
- **React Query** - State management

### Backend
- **Node.js** + **Express**
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Sécurité
- **PDFKit** - Génération de PDF

## 🚀 Installation

### Prérequis
- Node.js 18+
- MySQL 8+
- npm ou yarn

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/mock-data-creator.git
cd mock-data-creator
```

### 2. Installation du Frontend

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:8080`

### 3. Installation du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Créer la base de données
mysql -u root -p < ../database/schema.sql

# Optionnel: Charger des données de test
mysql -u root -p arch_excellence < ../database/seed.sql

# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

## 📁 Structure du projet

```
mock-data-creator/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── lib/               # Utilitaires et données
│   └── assets/            # Images et ressources
├── backend/               # Backend Node.js
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Contrôleurs
│   │   ├── models/        # Modèles de données
│   │   ├── routes/        # Routes API
│   │   ├── middleware/    # Middlewares
│   │   └── utils/         # Utilitaires
│   ├── uploads/           # Fichiers uploadés
│   └── generated/         # PDFs générés
├── database/              # Scripts SQL
│   ├── schema.sql         # Schéma de la base
│   └── seed.sql          # Données de test
└── DEPLOYMENT.md          # Guide de déploiement
```

## 🔐 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Entreprises
- `POST /api/companies` - Créer une entreprise
- `GET /api/companies` - Liste des entreprises
- `GET /api/companies/:id` - Détails d'une entreprise
- `PUT /api/companies/:id` - Modifier une entreprise
- `DELETE /api/companies/:id` - Supprimer une entreprise

### Admin
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/companies` - Liste des entreprises
- `PUT /api/admin/companies/:id/status` - Modifier statut

## 🌐 Déploiement

Consultez le fichier [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions détaillées de déploiement sur VPS Contabo.

### Résumé rapide

1. **VPS** : Contabo (Ubuntu 22.04)
2. **Serveur web** : Nginx
3. **Base de données** : MySQL
4. **Process manager** : PM2
5. **SSL** : Let's Encrypt

## 👤 Compte Admin par défaut

**Email**: admin@archexcellence.ci  
**Mot de passe**: Admin@123456

⚠️ **Changez ce mot de passe en production !**

## 📝 Scripts disponibles

### Frontend
```bash
npm run dev       # Serveur de développement
npm run build     # Build production
npm run preview   # Prévisualiser le build
npm run lint      # Linter
```

### Backend
```bash
npm run dev       # Serveur de développement (nodemon)
npm start         # Serveur production
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 License

MIT
