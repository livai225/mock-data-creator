-- Nettoyage des documents orphelins (liés à des entreprises supprimées)

-- 1. Supprimer les documents dont l'entreprise n'existe plus
DELETE d FROM documents d
LEFT JOIN companies c ON d.company_id = c.id
WHERE d.company_id IS NOT NULL AND c.id IS NULL;

-- 2. Supprimer les associés orphelins
DELETE a FROM associates a
LEFT JOIN companies c ON a.company_id = c.id
WHERE c.id IS NULL;

-- 3. Supprimer les managers orphelins
DELETE m FROM managers m
LEFT JOIN companies c ON m.company_id = c.id
WHERE c.id IS NULL;

-- 4. Ajouter les contraintes de clé étrangère avec ON DELETE CASCADE si elles n'existent pas
-- Note: Ces commandes peuvent échouer si les contraintes existent déjà, c'est normal

-- Pour la table documents
ALTER TABLE documents 
DROP FOREIGN KEY IF EXISTS fk_documents_company;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Pour la table associates
ALTER TABLE associates 
DROP FOREIGN KEY IF EXISTS fk_associates_company;

ALTER TABLE associates 
ADD CONSTRAINT fk_associates_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Pour la table managers
ALTER TABLE managers 
DROP FOREIGN KEY IF EXISTS fk_managers_company;

ALTER TABLE managers 
ADD CONSTRAINT fk_managers_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
