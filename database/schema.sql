-- ============================================
-- ARCH EXCELLENCE - Base de données MySQL
-- ============================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS arch_excellence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arch_excellence;

-- ============================================
-- Table: users (Utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: companies (Entreprises créées)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_type ENUM('SARL', 'EI', 'SNC', 'SCS', 'GIE', 'SA', 'SAS', 'COOPERATIVE') NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  activity TEXT NOT NULL,
  capital DECIMAL(15, 2) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Abidjan',
  gerant VARCHAR(255),
  status ENUM('draft', 'pending', 'processing', 'completed', 'rejected') DEFAULT 'draft',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  payment_amount DECIMAL(10, 2),
  payment_date DATETIME,
  payment_reference VARCHAR(100),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_company_type (company_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: associates (Associés)
-- ============================================
CREATE TABLE IF NOT EXISTS associates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  parts INT NOT NULL,
  percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: documents (Documents générés)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  document_type ENUM('statuts', 'dsv', 'bail', 'dirigeants', 'pv_constitution', 'formulaire_cepici', 'other') NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: payments (Paiements)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'FCFA',
  payment_method ENUM('card', 'mobile_money', 'bank_transfer', 'cash') NOT NULL,
  payment_reference VARCHAR(100) UNIQUE,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_status (status),
  INDEX idx_payment_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: activity_logs (Logs d'activité)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: notifications (Notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: settings (Paramètres système)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Données initiales
-- ============================================

-- Insérer un utilisateur admin par défaut
-- Mot de passe: Admin@123456 (à changer en production)
INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified) 
VALUES (
  'admin@archexcellence.ci',
  '$2a$10$rKZqYvJxKxKxKxKxKxKxKOqYvJxKxKxKxKxKxKxKxKxKxKxKxKxKx', -- Hash bcrypt de "Admin@123456"
  'Admin',
  'ARCH EXCELLENCE',
  'admin',
  TRUE,
  TRUE
);

-- Paramètres par défaut
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'ARCH EXCELLENCE', 'Nom du site'),
('site_email', 'contact@archexcellence.ci', 'Email de contact'),
('site_phone', '01 51 25 29 99', 'Téléphone de contact'),
('maintenance_mode', 'false', 'Mode maintenance'),
('allow_registration', 'true', 'Autoriser les inscriptions'),
('max_companies_per_user', '10', 'Nombre maximum d\'entreprises par utilisateur');

-- ============================================
-- Vues utiles
-- ============================================

-- Vue: Statistiques des entreprises par type
CREATE OR REPLACE VIEW company_stats AS
SELECT 
  company_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN payment_status = 'paid' THEN payment_amount ELSE 0 END) as total_revenue
FROM companies
GROUP BY company_type;

-- Vue: Utilisateurs actifs avec statistiques
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at,
  COUNT(DISTINCT c.id) as total_companies,
  SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_companies,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent
FROM users u
LEFT JOIN companies c ON u.id = c.user_id
LEFT JOIN payments p ON u.id = p.user_id
WHERE u.role = 'user'
GROUP BY u.id;
