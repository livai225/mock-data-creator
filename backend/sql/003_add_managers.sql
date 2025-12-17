-- Ajout du chiffre d'affaires prévisionnel
ALTER TABLE companies ADD COLUMN IF NOT EXISTS chiffre_affaires_prev VARCHAR(100);

-- Table des gérants (support multi-gérants)
CREATE TABLE IF NOT EXISTS managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenoms VARCHAR(150) NOT NULL,
  date_naissance VARCHAR(20),
  lieu_naissance VARCHAR(100),
  nationalite VARCHAR(100) DEFAULT 'Ivoirienne',
  adresse TEXT,
  type_identite ENUM('CNI', 'Passeport') DEFAULT 'CNI',
  numero_identite VARCHAR(100),
  date_delivrance_id VARCHAR(20),
  lieu_delivrance_id VARCHAR(100),
  pere_nom VARCHAR(255), -- Nom complet du père
  mere_nom VARCHAR(255), -- Nom complet de la mère
  duree_mandat VARCHAR(50),
  is_main BOOLEAN DEFAULT FALSE, -- Gérant principal (pour l'affichage rapide)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
