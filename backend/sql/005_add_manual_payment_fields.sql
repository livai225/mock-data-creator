-- Migration: Ajout des champs pour le paiement manuel
-- Date: 2026-01-02
-- Description: Ajout des colonnes pour gérer les paiements manuels avec preuve

-- Ajout des colonnes pour la preuve de paiement
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_path VARCHAR(255) COMMENT 'Chemin vers la capture du reçu';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100) COMMENT 'Référence de la transaction';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT COMMENT 'Raison du rejet si applicable';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_by INT COMMENT 'ID de l\'admin qui a validé';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS validated_at DATETIME COMMENT 'Date de validation';

-- Modifier la colonne payment_method pour ajouter 'manual_transfer'
ALTER TABLE payments MODIFY COLUMN payment_method ENUM('card', 'mobile_money', 'bank_transfer', 'cash', 'manual_transfer') NOT NULL;

-- Ajouter un statut 'rejected' si pas déjà présent
ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded', 'rejected') DEFAULT 'pending';

-- Modifier payment_status dans companies pour ajouter 'pending'
ALTER TABLE companies MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_validated_by ON payments(validated_by);

-- Clé étrangère pour validated_by
ALTER TABLE payments ADD CONSTRAINT fk_payment_validated_by 
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;
