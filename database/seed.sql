-- ============================================
-- ARCH EXCELLENCE - Données de test
-- ============================================

USE arch_excellence;

-- Insérer des utilisateurs de test
-- Mot de passe pour tous: Test@123456

INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, email_verified) VALUES
('john.doe@example.com', '$2a$10$rKZqYvJxKxKxKxKxKxKxKOqYvJxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'John', 'Doe', '+225 07 00 00 01', 'user', TRUE, TRUE),
('marie.kouame@example.com', '$2a$10$rKZqYvJxKxKxKxKxKxKxKOqYvJxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Marie', 'Kouamé', '+225 07 00 00 02', 'user', TRUE, TRUE),
('pierre.yao@example.com', '$2a$10$rKZqYvJxKxKxKxKxKxKxKOqYvJxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Pierre', 'Yao', '+225 07 00 00 03', 'user', TRUE, FALSE);

-- Insérer des entreprises de test
INSERT INTO companies (user_id, company_type, company_name, activity, capital, address, city, gerant, status, payment_status, payment_amount, payment_date, payment_reference) VALUES
(2, 'SARL', 'TECH SOLUTIONS CI', 'Développement de logiciels et solutions informatiques', 1000000, 'Cocody Riviera Palmeraie', 'Abidjan', 'Marie Kouamé', 'completed', 'paid', 75000, NOW(), 'PAY-2024-001'),
(2, 'EI', 'KOUAME CONSULTING', 'Conseil en gestion d\'entreprise', 0, 'Plateau Rue du Commerce', 'Abidjan', 'Marie Kouamé', 'pending', 'paid', 35000, NOW(), 'PAY-2024-002'),
(3, 'SARL', 'IMPORT EXPORT YAO', 'Import-export de produits agricoles', 5000000, 'Zone 4 Marcory', 'Abidjan', 'Pierre Yao', 'draft', 'unpaid', 75000, NULL, NULL);

-- Insérer des associés
INSERT INTO associates (company_id, name, parts, percentage) VALUES
(1, 'Marie Kouamé', 60, 60.00),
(1, 'Jean Baptiste', 40, 40.00),
(3, 'Pierre Yao', 70, 70.00),
(3, 'Aya Traoré', 30, 30.00);

-- Insérer des notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Entreprise créée', 'Votre entreprise TECH SOLUTIONS CI a été créée avec succès.', 'success', TRUE),
(2, 'Documents prêts', 'Les documents de votre entreprise TECH SOLUTIONS CI sont prêts à être téléchargés.', 'info', FALSE),
(3, 'Paiement en attente', 'Veuillez effectuer le paiement pour finaliser la création de IMPORT EXPORT YAO.', 'warning', FALSE);

-- Insérer des logs d'activité
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address) VALUES
(2, 'company_created', 'company', 1, 'Création de l\'entreprise TECH SOLUTIONS CI', '192.168.1.100'),
(2, 'company_created', 'company', 2, 'Création de l\'entreprise KOUAME CONSULTING', '192.168.1.100'),
(3, 'company_created', 'company', 3, 'Création de l\'entreprise IMPORT EXPORT YAO', '192.168.1.101'),
(1, 'login', 'user', 1, 'Connexion administrateur', '192.168.1.1');

-- Afficher un résumé
SELECT 'Base de données initialisée avec succès!' as Message;
SELECT COUNT(*) as 'Utilisateurs' FROM users;
SELECT COUNT(*) as 'Entreprises' FROM companies;
SELECT COUNT(*) as 'Associés' FROM associates;
