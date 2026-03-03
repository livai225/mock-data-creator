-- Migration 013: Ajouter tous les champs manquants identifiés par l'audit
-- Table leases pour les données bailleur, champs manquants dans companies et managers

-- =============================================
-- 1. TABLE LEASES (données bailleur)
-- =============================================
CREATE TABLE IF NOT EXISTS leases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  bailleur_nom VARCHAR(255) DEFAULT NULL,
  bailleur_prenom VARCHAR(255) DEFAULT NULL,
  bailleur_adresse TEXT DEFAULT NULL,
  bailleur_telephone VARCHAR(50) DEFAULT NULL,
  loyer_mensuel INT DEFAULT 0,
  caution_mois INT DEFAULT 2,
  avance_mois INT DEFAULT 2,
  duree_bail_annees INT DEFAULT 1,
  date_debut DATE DEFAULT NULL,
  date_fin DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================
-- 2. COLONNES MANQUANTES DANS COMPANIES
-- =============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS boite_postale VARCHAR(100) DEFAULT NULL AFTER adresse_postale;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS activite_secondaire TEXT DEFAULT NULL AFTER activity;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS nombre_parts INT DEFAULT NULL AFTER capital;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS valeur_part INT DEFAULT NULL AFTER nombre_parts;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS forme_juridique VARCHAR(100) DEFAULT NULL AFTER company_type;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS date_constitution DATE DEFAULT NULL AFTER chiffre_affaires_prev;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_contact VARCHAR(100) DEFAULT NULL AFTER declarant_email;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_numero_compte VARCHAR(100) DEFAULT NULL AFTER declarant_contact;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_est_associe TINYINT(1) DEFAULT 1 AFTER declarant_numero_compte;

-- =============================================
-- 3. COLONNE MANQUANTE DANS MANAGERS
-- =============================================
ALTER TABLE managers ADD COLUMN IF NOT EXISTS duree_mandat_annees INT DEFAULT NULL AFTER duree_mandat;
