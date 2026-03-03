-- Migration 012: Ajouter le champ capital_en_lettres
-- Ce champ stocke le capital social en toutes lettres (ex: "Un million de francs CFA")

ALTER TABLE companies ADD COLUMN capital_en_lettres VARCHAR(500) DEFAULT NULL AFTER chiffre_affaires_prev;
