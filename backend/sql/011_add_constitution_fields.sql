-- Migration 011: Ajouter les champs date_constitution, duree_societe, banque
-- Ces champs sont nécessaires pour que les documents générés depuis le dashboard
-- soient identiques à ceux du prévisualisateur

ALTER TABLE companies ADD COLUMN date_constitution DATE DEFAULT NULL AFTER chiffre_affaires_prev;
ALTER TABLE companies ADD COLUMN duree_societe INT DEFAULT 99 AFTER date_constitution;
ALTER TABLE companies ADD COLUMN banque VARCHAR(255) DEFAULT NULL AFTER duree_societe;
