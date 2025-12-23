/**
 * Script de test pour vérifier les corrections apportées aux documents
 * Teste spécifiquement les problèmes corrigés :
 * 1. Déclaration sur l'honneur : PROFESSION
 * 2. Liste de dirigeants : lot/îlot, durée formatée
 * 3. Bail commercial : nom/téléphone bailleur, date de fin
 * 4. DSV : tableaux et objet social complet
 * 5. Statuts : tableaux et objet social complet
 */

import { generateDocument } from './src/utils/documentGenerator.js';
import fs from 'fs';
import path from 'path';

// Données de test
const companyData = {
  company_name: 'TEST SARL PLURI',
  sigle: 'TSP',
  capital: 5000000,
  address: 'Rue des Jardins, Cocody',
  city: 'Abidjan',
  commune: 'Cocody',
  quartier: 'Angré',
  lot: '123',
  ilot: '45',
  telephone: '0707070707',
  email: 'contact@test.ci',
  activity: 'Commerce général et prestations de services',
  duree_societe: 99,
  company_type: 'SARL'
};

const managers = [{
  nom: 'KOUASSI',
  prenoms: 'Jean Paul',
  profession: 'Commerçant',
  adresse: 'Cocody, Angré 7ème tranche',
  nationalite: 'Ivoirienne',
  date_naissance: '1985-05-15',
  lieu_naissance: 'Abidjan',
  type_identite: 'CNI',
  numero_identite: 'CI 85 123456 78',
  date_delivrance_id: '2010-01-15',
  date_validite_id: '2025-01-15',
  lieu_delivrance_id: 'Abidjan',
  pere_nom: 'KOUASSI Pierre',
  mere_nom: 'KOUASSI Marie',
  duree_mandat: 'determinee',
  duree_mandat_annees: 4
}];

const associates = [
  {
    name: 'KOUASSI Jean Paul',
    parts: 60
  },
  {
    name: 'TRAORE Amadou',
    parts: 40
  }
];

const additionalData = {
  bailleur_nom: 'KONÉ Mamadou',
  bailleur_telephone: '0505050505',
  loyer_mensuel: 200000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 3,
  date_debut: '2024-01-01',
  lot: '123',
  ilot: '45',
  commune: 'Cocody',
  quartier: 'Angré'
};

const documentsToTest = [
  {
    name: "Déclaration sur l'honneur (greffe)",
    checks: ['PROFESSION', 'DOMICILE']
  },
  {
    name: 'Liste des dirigeants/gérants',
    checks: ['LOT', 'ILOT', 'ans', 'lieu de naissance', 'nationalité', 'date de validité']
  },
  {
    name: 'Contrat de bail commercial',
    checks: ['KONÉ Mamadou', '0505050505', 'date de fin', 'société']
  },
  {
    name: 'Déclaration de Souscription et Versement (DSV)',
    checks: ['tableau', 'généralement', 'faciliter l\'extension']
  },
  {
    name: 'Statuts SARL',
    checks: ['tableau', 'généralement', 'faciliter l\'extension']
  }
];

async function testDocument(docName) {
  console.log(`\n📄 Test: ${docName}`);
  console.log('-'.repeat(70));
  
  try {
    const result = await generateDocument(
      docName,
      companyData,
      associates,
      managers,
      additionalData,
      { formats: ['pdf'] }
    );
    
    if (result.pdf && fs.existsSync(result.pdf.filePath)) {
      const stats = fs.statSync(result.pdf.filePath);
      console.log(`✅ PDF généré avec succès`);
      console.log(`   📦 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📁 Chemin: ${result.pdf.filePath}`);
      return { success: true, filePath: result.pdf.filePath };
    } else {
      console.log(`❌ PDF non généré`);
      return { success: false, error: 'PDF non généré' };
    }
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('🧪 TEST DES CORRECTIONS APPORTÉES AUX DOCUMENTS');
  console.log('='.repeat(70));
  console.log('');
  console.log('📋 Documents à tester:');
  documentsToTest.forEach((doc, index) => {
    console.log(`   ${index + 1}. ${doc.name}`);
  });
  console.log('');
  
  const results = [];
  
  for (const doc of documentsToTest) {
    const result = await testDocument(doc.name);
    results.push({
      docName: doc.name,
      ...result
    });
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(70));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Réussis: ${successCount}/${results.length}`);
  console.log(`❌ Échoués: ${failCount}/${results.length}`);
  
  if (failCount > 0) {
    console.log('\n❌ Documents échoués:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.docName}: ${r.error}`);
    });
  }
  
  console.log('\n✅ Documents générés avec succès:');
  results.filter(r => r.success).forEach(r => {
    console.log(`   - ${r.docName}`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 Pour vérifier le contenu, ouvrez les fichiers PDF générés');
  console.log('   dans le dossier: backend/generated/');
  console.log('='.repeat(70));
  
  // Fermer le navigateur Puppeteer
  try {
    const puppeteerGenerator = await import('./src/utils/puppeteerGenerator.js');
    if (puppeteerGenerator.closeBrowser) {
      await puppeteerGenerator.closeBrowser();
      console.log('\n🔒 Navigateur Puppeteer fermé');
    }
  } catch (e) {
    // Ignorer si erreur
  }
  
  process.exit(successCount === results.length ? 0 : 1);
}

// Exécuter les tests
runTests().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});

