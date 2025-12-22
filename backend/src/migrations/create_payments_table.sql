-- Migration: Créer la table payments
-- Date: 2025-12-22

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  payment_method VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(100) NULL,
  payment_date DATETIME NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter un paiement de test (optionnel, décommentez si nécessaire)
-- INSERT INTO payments (user_id, company_id, amount, description, status)
-- SELECT u.id, c.id, 50000, 'Frais de création d''entreprise SARL', 'completed'
-- FROM users u
-- JOIN companies c ON c.user_id = u.id
-- WHERE u.email = 'test@test.com'
-- LIMIT 1;

