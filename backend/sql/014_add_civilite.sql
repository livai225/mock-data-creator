-- Migration 014: Ajouter le champ civilite pour les gérants et les associés
-- Valeurs possibles : 'M.' (Monsieur), 'Mme' (Madame), 'Mlle' (Mademoiselle)
-- DEFAULT 'M.' pour la rétrocompatibilité avec les données existantes

ALTER TABLE managers ADD COLUMN IF NOT EXISTS civilite ENUM('M.', 'Mme', 'Mlle') DEFAULT 'M.' AFTER id;
ALTER TABLE associates ADD COLUMN IF NOT EXISTS civilite ENUM('M.', 'Mme', 'Mlle') DEFAULT 'M.' AFTER id;
