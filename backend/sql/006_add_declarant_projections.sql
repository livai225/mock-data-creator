-- Ajout des colonnes pour le déclarant et les projections (Formulaire CEPICI)

-- Colonnes pour le déclarant
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_nom VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_qualite VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_adresse TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_telephone VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_fax VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_mobile VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS declarant_email VARCHAR(255);

-- Colonnes pour les projections sur 3 ans
ALTER TABLE companies ADD COLUMN IF NOT EXISTS investissement_annee1 DECIMAL(15,2) DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS investissement_annee2 DECIMAL(15,2) DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS investissement_annee3 DECIMAL(15,2) DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS emplois_annee1 INT DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS emplois_annee2 INT DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS emplois_annee3 INT DEFAULT 0;
