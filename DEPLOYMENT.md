# 🚀 Guide de déploiement sur VPS Contabo

Ce guide explique comment déployer ARCH EXCELLENCE sur un VPS Contabo.

## 📋 Prérequis

- VPS Contabo (VPS S ou M recommandé)
- Nom de domaine (ex: archexcellence.ci)
- Accès SSH au VPS

## 🖥️ Configuration du VPS

### 1. Connexion au VPS

```bash
ssh root@votre_ip_vps
```

### 2. Mise à jour du système

```bash
apt update && apt upgrade -y
```

### 3. Installation de Node.js

```bash
# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 4. Installation de MySQL

```bash
# Installer MySQL Server
apt install -y mysql-server

# Sécuriser MySQL
mysql_secure_installation
```

Répondez aux questions :
- Set root password? **Yes** (choisir un mot de passe fort)
- Remove anonymous users? **Yes**
- Disallow root login remotely? **Yes**
- Remove test database? **Yes**
- Reload privilege tables? **Yes**

### 5. Installation de Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 6. Installation de PM2 (gestionnaire de processus)

```bash
npm install -g pm2
```

### 7. Installation de Git

```bash
apt install -y git
```

## 📦 Déploiement de l'application

### 1. Créer un utilisateur pour l'application

```bash
adduser archexcellence
usermod -aG sudo archexcellence
su - archexcellence
```

### 2. Cloner le repository

```bash
cd ~
git clone https://github.com/votre-username/mock-data-creator.git
cd mock-data-creator
```

### 3. Configuration de la base de données

```bash
# Se connecter à MySQL
sudo mysql -u root -p

# Créer la base de données et l'utilisateur
CREATE DATABASE arch_excellence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'archexcellence'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON arch_excellence.* TO 'archexcellence'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importer le schéma
mysql -u archexcellence -p arch_excellence < database/schema.sql
```

### 4. Configuration du Backend

```bash
cd backend
npm install --production

# Créer le fichier .env
cp .env.example .env
nano .env
```

Configurer le fichier `.env` :

```env
NODE_ENV=production
PORT=5000
API_URL=https://api.archexcellence.ci
FRONTEND_URL=https://archexcellence.ci

DB_HOST=localhost
DB_USER=archexcellence
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=arch_excellence
DB_PORT=3306

JWT_SECRET=generer_une_cle_secrete_tres_longue_et_aleatoire
JWT_EXPIRE=7d

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_app_password
```

### 5. Démarrer le backend avec PM2

```bash
pm2 start src/server.js --name arch-excellence-api
pm2 save
pm2 startup
```

### 6. Configuration du Frontend

```bash
cd ../
npm install
npm run build
```

### 7. Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/archexcellence
```

Ajouter la configuration :

```nginx
# API Backend
server {
    listen 80;
    server_name api.archexcellence.ci;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name archexcellence.ci www.archexcellence.ci;

    root /home/archexcellence/mock-data-creator/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/archexcellence /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Installation SSL avec Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL
sudo certbot --nginx -d archexcellence.ci -d www.archexcellence.ci -d api.archexcellence.ci
```

Suivre les instructions et choisir de rediriger HTTP vers HTTPS.

### 9. Configuration du Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🔄 Mises à jour

### Script de déploiement automatique

Créer un script `deploy.sh` :

```bash
#!/bin/bash

echo "🚀 Déploiement ARCH EXCELLENCE..."

# Aller dans le répertoire
cd /home/archexcellence/mock-data-creator

# Pull les dernières modifications
git pull origin main

# Backend
echo "📦 Mise à jour du backend..."
cd backend
npm install --production
pm2 restart arch-excellence-api

# Frontend
echo "🎨 Build du frontend..."
cd ..
npm install
npm run build

echo "✅ Déploiement terminé !"
```

Rendre le script exécutable :

```bash
chmod +x deploy.sh
```

Pour déployer :

```bash
./deploy.sh
```

## 📊 Monitoring

### Voir les logs

```bash
# Logs du backend
pm2 logs arch-excellence-api

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Statut des services

```bash
# PM2
pm2 status

# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql
```

## 🔐 Sécurité

### 1. Changer le mot de passe admin

Se connecter à MySQL et exécuter :

```sql
USE arch_excellence;
UPDATE users 
SET password = '$2a$10$nouveau_hash_bcrypt' 
WHERE email = 'admin@archexcellence.ci';
```

### 2. Configurer les sauvegardes MySQL

```bash
# Créer un script de backup
nano /home/archexcellence/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/archexcellence/backups"
mkdir -p $BACKUP_DIR

mysqldump -u archexcellence -p'votre_password' arch_excellence > $BACKUP_DIR/arch_excellence_$DATE.sql

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "arch_excellence_*.sql" -mtime +7 -delete
```

Ajouter au crontab :

```bash
crontab -e

# Backup quotidien à 2h du matin
0 2 * * * /home/archexcellence/backup-db.sh
```

## 🎯 Optimisations

### 1. Optimiser MySQL

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Ajouter :

```ini
[mysqld]
max_connections = 100
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
```

Redémarrer MySQL :

```bash
sudo systemctl restart mysql
```

### 2. Optimiser PM2

```bash
pm2 start src/server.js --name arch-excellence-api -i max --max-memory-restart 500M
pm2 save
```

## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs`
2. Vérifier Nginx : `sudo nginx -t`
3. Vérifier MySQL : `sudo systemctl status mysql`

## ✅ Checklist finale

- [ ] VPS configuré et sécurisé
- [ ] Node.js, MySQL, Nginx installés
- [ ] Base de données créée et importée
- [ ] Backend déployé avec PM2
- [ ] Frontend buildé et servi par Nginx
- [ ] SSL configuré avec Let's Encrypt
- [ ] Firewall activé
- [ ] Mot de passe admin changé
- [ ] Sauvegardes configurées
- [ ] Domaine pointé vers le VPS

🎉 **Votre application est maintenant en ligne !**
