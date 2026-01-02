-- Migration: Ajout des champs manquants dans la table managers
-- Date: 2026-01-01
-- Description: Ajout de profession, date_validite_id et ville_residence

-- Ajout du champ profession
ALTER TABLE managers ADD COLUMN IF NOT EXISTS profession VARCHAR(150);

-- Ajout du champ date_validite_id (date de validité de la pièce d'identité)
ALTER TABLE managers ADD COLUMN IF NOT EXISTS date_validite_id VARCHAR(20);

-- Ajout du champ ville_residence (ville de résidence du gérant)
ALTER TABLE managers ADD COLUMN IF NOT EXISTS ville_residence VARCHAR(100);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_managers_company_main ON managers(company_id, is_main);
