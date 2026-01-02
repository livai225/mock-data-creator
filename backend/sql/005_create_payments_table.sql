-- Migration: Création de la table des paiements
-- Date: 2026-01-01
-- Description: Table pour gérer les paiements manuels avec preuve de dépôt

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'mobile_money',
  phone_number VARCHAR(20),
  transaction_reference VARCHAR(100),
  proof_image_path TEXT,
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  verified_by INT,
  verified_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_company_payment (company_id),
  INDEX idx_user_payment (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter une colonne payment_status dans la table companies si elle n'existe pas
ALTER TABLE companies ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid';

-- Mettre à jour les anciennes entreprises
UPDATE companies SET payment_status = 'unpaid' WHERE payment_status IS NULL;
