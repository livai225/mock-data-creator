/**
 * Script de test simplifié : Génération de documents sans DB
 * Pour tester le flux complet avec DB, utilisez l'interface web
 */

import { generateMultipleDocuments } from './src/utils/documentGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Données de test pour une entreprise SARLU
const companyData = {
  company_name: 'TEST COMPANY SARLU',
  capital: 1000000,
  address: '123 Rue Test, Cocody Angré, LOT 5, ILOT 10',
  city: 'Abidjan',
  activity: 'Commerce général, import-export, vente de produits divers',
  gerant: 'Jean Dupont',
  duree_societe: 99,
  chiffre_affaires_prev: 5000000,
  managers: [{
    nom: 'Jean',
    prenoms: 'Dupont',
    date_naissance: '1990-01-15',
    lieu_naissance: 'Abidjan',
    nationalite: 'Ivoirienne',
    adresse: '123 Rue Test, Cocody',
    profession: 'Commerçant',
    type_identite: 'CNI',
    numero_identite: 'CI123456789',
    date_delivrance_id: '2015-01-01',
    date_validite_id: '2025-01-01',
    lieu_delivrance_id: 'Abidjan',
    duree_mandat: 4
  }]
};

const associates = [{
  name: 'Jean Dupont',
  parts: 100
}];

const managers = companyData.managers;

// Données additionnelles pour le bail
const additionalData = {
  bailleur_nom: 'Marie Martin',
  bailleur_telephone: '+225 07 12 34 56 78',
  loyer_mensuel: 500000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 3,
  date_debut: new Date().toISOString()
};

// Liste des documents à générer
const docs = [
  'Statuts SARL',
  'Contrat de bail commercial',
  'Formulaire unique CEPICI',
  'Liste des dirigeants/gérants',
  'Déclaration sur l\'honneur (greffe)',
  'Déclaration de Souscription et Versement (DSV)'
];

async function testGeneration() {
  console.log('🧪 TEST DE GÉNÉRATION DE DOCUMENTS');
  console.log('='.repeat(60));
  console.log(`\n🏢 Entreprise: ${companyData.company_name}`);
  console.log(`   Capital: ${companyData.capital.toLocaleString('fr-FR')} FCFA`);
  console.log(`   Gérant: ${companyData.gerant}`);
  console.log(`\n📄 Documents à générer: ${docs.length}`);
  console.log(`   - ${docs.join('\n   - ')}\n`);
  console.log('='.repeat(60));
  
  try {
    console.log('\n🚀 Début de la génération...\n');
    
    const results = await generateMultipleDocuments(
      docs,
      companyData,
      associates,
      managers,
      additionalData,
      { formats: ['pdf', 'docx'] }
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RÉSULTATS DE GÉNÉRATION\n');
    
    let successCount = 0;
    let failCount = 0;
    const generatedFiles = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`${i + 1}. ${result.docName}`);
      console.log('-'.repeat(60));
      
      if (result.error) {
        console.log(`   ❌ Erreur: ${result.error}\n`);
        failCount++;
        continue;
      }
      
      // Vérifier PDF
      if (result.pdf) {
        const pdfExists = fs.existsSync(result.pdf.filePath);
        const pdfSize = pdfExists ? fs.statSync(result.pdf.filePath).size : 0;
        const pdfSizeKB = (pdfSize / 1024).toFixed(2);
        
        console.log(`   📕 PDF: ${result.pdf.fileName}`);
        console.log(`      Taille: ${pdfSizeKB} KB`);
        console.log(`      Existe: ${pdfExists ? '✅' : '❌'}`);
        console.log(`      Chemin: ${result.pdf.filePath}`);
        
        if (pdfExists) {
          generatedFiles.push({
            type: 'PDF',
            name: result.docName,
            file: result.pdf.fileName,
            size: pdfSizeKB + ' KB',
            path: result.pdf.filePath
          });
        }
      }
      
      // Vérifier DOCX
      if (result.docx) {
        const docxExists = fs.existsSync(result.docx.filePath);
        const docxSize = docxExists ? fs.statSync(result.docx.filePath).size : 0;
        const docxSizeKB = (docxSize / 1024).toFixed(2);
        
        console.log(`   📘 DOCX: ${result.docx.fileName}`);
        console.log(`      Taille: ${docxSizeKB} KB`);
        console.log(`      Existe: ${docxExists ? '✅' : '❌'}`);
        console.log(`      Chemin: ${result.docx.filePath}`);
        
        if (docxExists) {
          generatedFiles.push({
            type: 'DOCX',
            name: result.docName,
            file: result.docx.fileName,
            size: docxSizeKB + ' KB',
            path: result.docx.filePath
          });
        }
      }
      
      console.log('');
      successCount++;
    }
    
    console.log('='.repeat(60));
    console.log('\n📈 STATISTIQUES\n');
    console.log(`✅ Documents générés avec succès: ${successCount}/${results.length}`);
    console.log(`❌ Documents en erreur: ${failCount}/${results.length}`);
    console.log(`📁 Fichiers créés: ${generatedFiles.length}`);
    
    if (generatedFiles.length > 0) {
      console.log('\n📋 FICHIERS GÉNÉRÉS\n');
      generatedFiles.forEach((file, index) => {
        console.log(`${index + 1}. [${file.type}] ${file.name}`);
        console.log(`   ${file.file} (${file.size})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 PROCHAINES ÉTAPES\n');
    console.log('1. Ouvrez les fichiers PDF dans: backend/generated/');
    console.log('2. Vérifiez que tous les articles sont présents:');
    console.log('   - Contrat de bail: 9 articles (Article 1 à Article 9)');
    console.log('   - Statuts SARL: 25 articles pour SARLU');
    console.log('3. Vérifiez qu\'il n\'y a pas de pages en double');
    console.log('4. Vérifiez que le footer n\'apparaît qu\'à la fin');
    console.log('\n5. Pour tester le flux complet avec DB:');
    console.log('   - Démarrez le serveur: npm run dev');
    console.log('   - Créez une entreprise via l\'interface web');
    console.log('   - Générez les documents');
    console.log('   - Vérifiez dans le dashboard que les documents sont visibles\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

// Exécuter le test
testGeneration();

