-- Migration: Ajouter le champ sigle à la table companies
-- Date: 2026-01-29

ALTER TABLE companies ADD COLUMN IF NOT EXISTS sigle VARCHAR(50) DEFAULT NULL;
