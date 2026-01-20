-- Ajout des colonnes détaillées pour les associés (Statuts SARL)

ALTER TABLE associates ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE associates ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100);
ALTER TABLE associates ADD COLUMN IF NOT EXISTS date_naissance DATE;
ALTER TABLE associates ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(255);
ALTER TABLE associates ADD COLUMN IF NOT EXISTS adresse TEXT;
ALTER TABLE associates ADD COLUMN IF NOT EXISTS type_identite VARCHAR(50);
ALTER TABLE associates ADD COLUMN IF NOT EXISTS numero_identite VARCHAR(100);
ALTER TABLE associates ADD COLUMN IF NOT EXISTS date_delivrance_id DATE;
ALTER TABLE associates ADD COLUMN IF NOT EXISTS date_validite_id DATE;
ALTER TABLE associates ADD COLUMN IF NOT EXISTS lieu_delivrance_id VARCHAR(255);
