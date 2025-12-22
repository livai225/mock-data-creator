/**
 * Script de test pour générer des documents et vérifier leur contenu
 */

import { generateDocument } from './src/utils/documentGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Données de test pour SARLU
const companySARLU = {
  company_name: 'TEST SARLU',
  capital: 1000000,
  address: '123 Rue Test, LOT 5, ILOT 10',
  city: 'Abidjan',
  activity: 'Commerce général',
  gerant: 'Jean Dupont',
  duree_societe: 99,
  chiffre_affaires_prev: 5000000
};

const associatesSARLU = [{
  name: 'Jean Dupont',
  parts: 100
}];

const managersSARLU = [{
  nom: 'Jean',
  prenoms: 'Dupont',
  date_naissance: '1990-01-15',
  lieu_naissance: 'Abidjan',
  nationalite: 'Ivoirienne',
  adresse: '123 Rue Test',
  profession: 'Commerçant',
  type_identite: 'CNI',
  numero_identite: 'CI123456789',
  date_delivrance_id: '2015-01-01',
  date_validite_id: '2025-01-01',
  lieu_delivrance_id: 'Abidjan',
  duree_mandat: 4
}];

const bailleurData = {
  bailleur_nom: 'Marie Martin',
  bailleur_telephone: '+225 07 12 34 56 78',
  loyer_mensuel: 500000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 3,
  date_debut: new Date().toISOString(),
  date_fin: null
};

// Liste des documents à tester
const docsToTest = [
  'Statuts SARL',
  'Contrat de bail commercial',
  'Formulaire unique CEPICI',
  'Liste des dirigeants/gérants',
  'Déclaration sur l\'honneur (greffe)',
  'Déclaration de Souscription et Versement (DSV)'
];

async function testDocumentGeneration() {
  console.log('🧪 Début des tests de génération de documents\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const docName of docsToTest) {
    console.log(`\n📄 Test: ${docName}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await generateDocument(
        docName,
        companySARLU,
        associatesSARLU,
        managersSARLU,
        bailleurData,
        { formats: ['pdf'] }
      );
      
      if (result.pdf) {
        const stats = fs.statSync(result.pdf.filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`✅ PDF généré: ${result.pdf.fileName}`);
        console.log(`   Taille: ${fileSizeKB} KB`);
        console.log(`   Chemin: ${result.pdf.filePath}`);
        
        // Vérifier le contenu du PDF en lisant le fichier texte généré
        // (on ne peut pas lire directement le PDF, mais on peut vérifier qu'il existe)
        if (fs.existsSync(result.pdf.filePath)) {
          console.log(`   ✅ Fichier existe et est accessible`);
        }
        
        results.push({
          docName,
          success: true,
          fileName: result.pdf.fileName,
          fileSize: fileSizeKB + ' KB',
          filePath: result.pdf.filePath
        });
      } else {
        console.log(`❌ Aucun PDF généré`);
        results.push({
          docName,
          success: false,
          error: 'Aucun PDF généré'
        });
      }
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
      results.push({
        docName,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RÉSUMÉ DES TESTS\n');
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Réussis: ${successCount}/${results.length}`);
  console.log(`❌ Échoués: ${failCount}/${results.length}\n`);
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.docName}: ${result.fileSize}`);
    } else {
      console.log(`❌ ${result.docName}: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Pour vérifier le contenu des documents:');
  console.log('   1. Ouvrez les fichiers PDF générés dans backend/generated/');
  console.log('   2. Vérifiez que tous les articles sont présents');
  console.log('   3. Vérifiez qu\'il n\'y a pas de pages en double');
  console.log('   4. Vérifiez que le footer n\'apparaît qu\'à la fin\n');
}

// Exécuter les tests
testDocumentGeneration().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

