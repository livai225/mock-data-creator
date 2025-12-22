import { generateDocument, generateMultipleDocuments } from './src/utils/documentGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test de génération PDF avec pdfmake\n');
console.log('='.repeat(60));

// Données de test pour une entreprise
const testCompany = {
  company_name: 'TEST SERVICES SARL',
  company_type: 'SARL',
  capital: 1000000,
  address: 'Cocody, Riviera 2, Abidjan',
  city: 'Abidjan',
  activity: 'Services de conseil et d\'assistance aux entreprises',
  gerant: 'JEAN DUPONT',
  duree_societe: 99,
  chiffre_affaires_prev: 5000000,
  sigle: 'TS',
  commune: 'Cocody',
  telephone: '+225 07 12 34 56 78',
  email: 'contact@testservices.ci'
};

const testManagers = [
  {
    nom: 'DUPONT',
    prenoms: 'Jean',
    date_naissance: '1980-05-15',
    lieu_naissance: 'Abidjan',
    nationalite: 'Ivoirienne',
    adresse: 'Cocody, Riviera 2',
    profession: 'Consultant',
    type_identite: 'CNI',
    numero_identite: 'CI123456789',
    date_delivrance_id: '2015-01-10',
    lieu_delivrance_id: 'Abidjan',
    pere_nom: 'DUPONT Pierre',
    mere_nom: 'MARTIN Marie',
    duree_mandat: '4 ans'
  }
];

const testAssociates = [
  {
    name: 'JEAN DUPONT',
    parts: 100,
    percentage: 100
  }
];

const testAdditionalData = {
  bailleur_nom: 'Marie Martin',
  bailleur_telephone: '+225 07 98 76 54 32',
  loyer_mensuel: 500000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 3,
  date_debut: new Date().toISOString()
};

// Liste des documents à tester
const documentsToTest = [
  'Statuts SARL',
  'Contrat de bail commercial',
  'Formulaire unique CEPICI',
  'Liste des dirigeants/gérants',
  'Déclaration sur l\'honneur (greffe)',
  'Déclaration de Souscription et Versement (DSV)'
];

async function testDocumentGeneration() {
  console.log('\n📋 Documents à générer:');
  documentsToTest.forEach((doc, index) => {
    console.log(`   ${index + 1}. ${doc}`);
  });

  console.log('\n🚀 Début de la génération...\n');

  try {
    // Générer tous les documents
    const results = await generateMultipleDocuments(
      documentsToTest,
      testCompany,
      testAssociates,
      testManagers,
      testAdditionalData,
      { formats: ['pdf'] } // Générer seulement PDF pour le test
    );

    console.log('\n📦 Résultats de génération:');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const docName = documentsToTest[i] || `Document ${i + 1}`;

      console.log(`\n📄 ${docName}:`);

      if (result.error) {
        errorCount++;
        console.log(`   ❌ Erreur: ${result.error.message}`);
        if (result.error.stack) {
          console.log(`   Stack: ${result.error.stack.split('\n')[0]}`);
        }
      } else {
        if (result.pdf) {
          successCount++;
          const pdfPath = result.pdf.filePath;
          const pdfExists = fs.existsSync(pdfPath);
          
          if (pdfExists) {
            const stats = fs.statSync(pdfPath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ✅ PDF généré: ${result.pdf.fileName}`);
            console.log(`   📁 Chemin: ${pdfPath}`);
            console.log(`   📊 Taille: ${fileSizeKB} KB`);
            
            // Vérifier que le fichier n'est pas vide
            if (stats.size === 0) {
              console.log(`   ⚠️  ATTENTION: Le fichier PDF est vide!`);
            } else if (stats.size < 1000) {
              console.log(`   ⚠️  ATTENTION: Le fichier PDF semble trop petit (${stats.size} bytes)`);
            } else {
              console.log(`   ✅ Fichier PDF valide`);
            }
          } else {
            console.log(`   ❌ Fichier PDF non trouvé: ${pdfPath}`);
            errorCount++;
          }
        } else {
          console.log(`   ⚠️  Aucun PDF généré`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Succès: ${successCount}/${documentsToTest.length}`);
    console.log(`   ❌ Erreurs: ${errorCount}/${documentsToTest.length}`);

    if (successCount === documentsToTest.length) {
      console.log(`\n🎉 Tous les documents ont été générés avec succès!`);
      console.log(`\n📁 Les fichiers PDF sont disponibles dans: ${path.join(__dirname, 'generated')}`);
    } else {
      console.log(`\n⚠️  Certains documents n'ont pas pu être générés.`);
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la génération:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Exécuter le test
testDocumentGeneration()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

