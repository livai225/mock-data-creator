# 🚀 Commandes de Déploiement - Dashboard Admin Final

## 📋 Option 1 : Script Automatique (Recommandé)

### Sur le serveur :
```bash
cd /var/www/mock-data-creator
bash deploy-admin-dashboard.sh
```

---

## 📋 Option 2 : Commandes Manuelles

### 1️⃣ Récupérer le code
```bash
cd /var/www/mock-data-creator
git pull origin main
```

### 2️⃣ Installer les dépendances backend
```bash
cd /var/www/mock-data-creator/backend
npm install
```

### 3️⃣ Installer les dépendances frontend
```bash
cd /var/www/mock-data-creator
npm install
```

### 4️⃣ Build du frontend
```bash
npm run build
```

### 5️⃣ Redémarrer PM2
```bash
pm2 restart arch-excellence-api
```

### 6️⃣ Recharger Nginx
```bash
sudo systemctl reload nginx
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier PM2
```bash
pm2 list
pm2 logs arch-excellence-api --lines 50
```

### 2. Vérifier Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 3. Tester l'API
```bash
# Test de santé
curl http://localhost:5000/api/health

# Test stats overview (nécessite un token admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/stats/overview

# Test liste utilisateurs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/users

# Test liste entreprises
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/companies
```

### 4. Vérifier la base de données
```bash
sudo mysql arch_excellence -e "SELECT COUNT(*) as total_users FROM users;"
sudo mysql arch_excellence -e "SELECT COUNT(*) as total_companies FROM companies;"
sudo mysql arch_excellence -e "SELECT COUNT(*) as total_documents FROM documents;"
sudo mysql arch_excellence -e "SELECT company_type, COUNT(*) as count FROM companies GROUP BY company_type;"
```

---

## 🌐 URLs à Tester dans le Navigateur

### Dashboard Admin
- **Dashboard principal** : http://31.220.82.109/admin
- **Utilisateurs** : http://31.220.82.109/admin/utilisateurs
- **Entreprises** : http://31.220.82.109/admin/entreprises
- **Documents** : http://31.220.82.109/admin/documents
- **Paiements** : http://31.220.82.109/admin/paiements
- **Tarifs** : http://31.220.82.109/admin/tarifs
- **Bannière** : http://31.220.82.109/admin/banniere

### Connexion Admin
1. Aller sur : http://31.220.82.109/connexion
2. Se connecter avec : `admin@admin.com`
3. Aller sur : http://31.220.82.109/admin

---

## 🔍 Tests Fonctionnels à Faire

### Dashboard Principal
- [ ] Les KPIs s'affichent correctement (utilisateurs, entreprises, revenus)
- [ ] Le graphique des revenus se charge
- [ ] Le graphique par type d'entreprise s'affiche avec les bonnes données
- [ ] Les alertes rapides montrent les paiements en attente
- [ ] L'activité récente se met à jour

### Page Utilisateurs
- [ ] La liste des utilisateurs s'affiche (7 clients + 1 admin = 8)
- [ ] La recherche fonctionne
- [ ] Les filtres par rôle fonctionnent (admin/client)
- [ ] Les filtres par statut fonctionnent (actif/inactif)
- [ ] Le bouton "Activer/Désactiver" fonctionne
- [ ] Le bouton "Changer le rôle" fonctionne

### Page Entreprises
- [ ] La liste des entreprises s'affiche (7 entreprises)
- [ ] La recherche fonctionne
- [ ] Les filtres par type fonctionnent
- [ ] Les filtres par statut fonctionnent
- [ ] Le changement de statut fonctionne
- [ ] Le bouton "Voir détails" ouvre le modal
- [ ] L'export CSV fonctionne

### Page Documents
- [ ] La liste des documents s'affiche
- [ ] La recherche fonctionne
- [ ] Le filtre par type fonctionne
- [ ] Le téléchargement d'un document fonctionne
- [ ] Le téléchargement en batch fonctionne

### Page Paiements
- [ ] Les paiements en attente s'affichent
- [ ] La preuve de paiement s'affiche
- [ ] Le bouton "Valider" fonctionne
- [ ] Le bouton "Rejeter" fonctionne
- [ ] Le statut se met à jour après validation

---

## 🐛 Dépannage

### Problème : Dashboard vide ou stats à 0

**Solution 1 : Vérifier la base de données**
```bash
sudo mysql arch_excellence -e "SELECT role, COUNT(*) FROM users GROUP BY role;"
sudo mysql arch_excellence -e "SELECT COUNT(*) FROM companies;"
```

**Solution 2 : Vérifier les logs API**
```bash
pm2 logs arch-excellence-api --lines 100
```

**Solution 3 : Vérifier la colonne updated_at**
```bash
sudo mysql arch_excellence -e "DESCRIBE users;"
```

Si `updated_at` n'existe pas :
```bash
sudo mysql arch_excellence -e "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;"
sudo mysql arch_excellence -e "UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;"
```

---

### Problème : Erreur 500 sur les routes admin

**Solution 1 : Vérifier les permissions**
```bash
ls -la /var/www/mock-data-creator/backend/src/controllers/
ls -la /var/www/mock-data-creator/backend/src/routes/
```

**Solution 2 : Vérifier les imports**
```bash
grep -r "getAllUsers" /var/www/mock-data-creator/backend/src/
grep -r "getAllCompanies" /var/www/mock-data-creator/backend/src/
```

**Solution 3 : Redémarrer PM2 avec logs**
```bash
pm2 restart arch-excellence-api
pm2 logs arch-excellence-api --lines 50
```

---

### Problème : Frontend ne se met pas à jour

**Solution 1 : Vider le cache du navigateur**
- Ctrl + Shift + R (Windows/Linux)
- Cmd + Shift + R (Mac)

**Solution 2 : Vérifier le build**
```bash
cd /var/www/mock-data-creator
npm run build
ls -la dist/
```

**Solution 3 : Vérifier Nginx**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Problème : Graphique par type d'entreprise vide

**Solution 1 : Vérifier les données**
```bash
sudo mysql arch_excellence -e "
  SELECT 
    company_type,
    COUNT(*) as count
  FROM companies
  GROUP BY company_type;
"
```

**Solution 2 : Vérifier l'API**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/stats/companies?period=365d
```

**Solution 3 : Vérifier les logs frontend**
- Ouvrir la console du navigateur (F12)
- Onglet "Console"
- Chercher les erreurs

---

## 📊 Requêtes SQL Utiles

### Statistiques générales
```sql
-- Nombre d'utilisateurs par rôle
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Nombre d'entreprises par type
SELECT company_type, COUNT(*) as count FROM companies GROUP BY company_type;

-- Nombre d'entreprises par statut de paiement
SELECT payment_status, COUNT(*) as count FROM companies GROUP BY payment_status;

-- Revenus totaux
SELECT 
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
FROM payments;

-- Entreprises créées cette semaine
SELECT COUNT(*) as new_this_week 
FROM companies 
WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Documents générés aujourd'hui
SELECT COUNT(*) as generated_today 
FROM documents 
WHERE DATE(created_at) = CURDATE();
```

### Données détaillées
```sql
-- Liste complète des entreprises avec utilisateur
SELECT 
  c.id,
  c.company_name,
  c.company_type,
  c.payment_status,
  c.created_at,
  u.email as user_email,
  (SELECT COUNT(*) FROM documents WHERE company_id = c.id) as docs_count
FROM companies c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Activité récente
SELECT 
  'company' as type,
  company_name as name,
  created_at
FROM companies
UNION ALL
SELECT 
  'user' as type,
  email as name,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;
```

---

## ✅ Checklist Finale

Avant de valider le déploiement, vérifier :

- [ ] Code pushé sur Git
- [ ] Pull effectué sur le serveur
- [ ] Dépendances installées (backend + frontend)
- [ ] Frontend buildé
- [ ] PM2 redémarré
- [ ] Nginx rechargé
- [ ] API répond correctement
- [ ] Dashboard admin accessible
- [ ] Stats s'affichent correctement
- [ ] Graphiques se chargent
- [ ] Listes d'utilisateurs/entreprises/documents fonctionnent
- [ ] Actions admin fonctionnent (toggle, role, status)
- [ ] Pas d'erreurs dans les logs PM2
- [ ] Pas d'erreurs dans la console navigateur

---

## 🎉 Résultat Attendu

Après le déploiement, le dashboard admin doit afficher :

```
📊 DASHBOARD ADMIN
==================

👥 Utilisateurs: 8 (7 clients + 1 admin)
🏢 Entreprises: 7
📄 Documents: ~35 (5 docs × 7 entreprises)
💰 Revenus: Variable selon les paiements

📈 Graphique des revenus: Courbe d'évolution
🏢 Répartition par type: Barres colorées avec %
🔔 Alertes: Paiements en attente
📋 Activité: Dernières actions
```

**Si tout fonctionne → Dashboard admin 100% opérationnel ! 🎉**
