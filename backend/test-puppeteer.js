/**
 * Test de génération de documents avec Puppeteer
 * Usage: node test-puppeteer.js
 */

import { generateMultipleDocuments } from './src/utils/documentGenerator.js';
import { closeBrowser } from './src/utils/puppeteerGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Données de test
const companyData = {
  company_name: 'TEST PUPPETEER SARL',
  company_type: 'SARL',
  sigle: 'TPS',
  capital: 1000000,
  duree_societe: 99,
  address: '123 Rue de la Paix, Cocody',
  city: 'Abidjan',
  activity: 'Commerce général, import-export, prestations de services informatiques',
  commune: 'Cocody',
  quartier: 'Angré',
  lot: '123',
  ilot: '45',
  telephone: '+225 07 07 07 07 07',
  email: 'contact@test-puppeteer.ci'
};

const associates = [
  { name: 'DUPONT Jean', parts: 60 },
  { name: 'MARTIN Marie', parts: 40 }
];

const managers = [
  {
    nom: 'DUPONT',
    prenoms: 'Jean Pierre',
    date_naissance: '1985-03-15',
    lieu_naissance: 'Abidjan',
    nationalite: 'Ivoirienne',
    adresse: 'Cocody Angré, Abidjan',
    profession: 'Entrepreneur',
    type_identite: 'CNI',
    numero_identite: 'CI-123456789',
    date_delivrance_id: '2020-01-15',
    date_validite_id: '2030-01-15',
    lieu_delivrance_id: 'Abidjan',
    pere_nom: 'DUPONT Pierre',
    mere_nom: 'KONAN Marie',
    duree_mandat: 'Durée indéterminée'
  }
];

const additionalData = {
  bailleur_nom: 'KOUAME Konan',
  bailleur_telephone: '+225 05 05 05 05 05',
  loyer_mensuel: 150000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 2,
  lot: '123',
  ilot: '45'
};

const documentsToGenerate = [
  'Statuts SARL',
  'Contrat de bail commercial',
  'Formulaire unique CEPICI',
  'Liste des dirigeants/gérants',
  "Déclaration sur l'honneur (greffe)",
  'Déclaration de Souscription et Versement (DSV)'
];

async function runTest() {
  console.log('='.repeat(70));
  console.log('🧪 TEST DE GÉNÉRATION PDF AVEC PUPPETEER');
  console.log('='.repeat(70));
  console.log('');
  console.log(`📌 Société: ${companyData.company_name}`);
  console.log(`📌 Capital: ${companyData.capital.toLocaleString('fr-FR')} FCFA`);
  console.log(`📌 Documents à générer: ${documentsToGenerate.length}`);
  console.log('');
  console.log('-'.repeat(70));
  
  try {
    console.log('\n🚀 Démarrage de la génération...\n');
    
    const startTime = Date.now();
    
    const results = await generateMultipleDocuments(
      documentsToGenerate,
      companyData,
      associates,
      managers,
      additionalData,
      { formats: ['pdf'] }  // Seulement PDF pour le test
    );
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSULTATS');
    console.log('='.repeat(70));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const result of results) {
      if (result.error) {
        console.log(`\n❌ ${result.docName}`);
        console.log(`   Erreur: ${result.error}`);
        errorCount++;
      } else if (result.pdf) {
        const stats = fs.statSync(result.pdf.filePath);
        console.log(`\n✅ ${result.docName}`);
        console.log(`   📄 Fichier: ${result.pdf.fileName}`);
        console.log(`   📦 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   📁 Chemin: ${result.pdf.filePath}`);
        successCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📈 RÉSUMÉ');
    console.log('='.repeat(70));
    console.log(`   ✅ Succès: ${successCount}/${documentsToGenerate.length}`);
    console.log(`   ❌ Erreurs: ${errorCount}/${documentsToGenerate.length}`);
    console.log(`   ⏱️  Durée: ${duration} secondes`);
    console.log('');
    
    if (successCount > 0) {
      console.log('📂 Les fichiers PDF ont été générés dans: backend/generated/');
      console.log('   Ouvrez-les pour vérifier le rendu.');
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message);
    console.error(error.stack);
  } finally {
    // Fermer le navigateur Puppeteer
    console.log('\n🔒 Fermeture de Puppeteer...');
    await closeBrowser();
    console.log('✅ Test terminé.');
    process.exit(0);
  }
}

runTest();

