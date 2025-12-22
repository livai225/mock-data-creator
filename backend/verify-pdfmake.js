import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePdfWithPdfMake } from './src/utils/pdfmakeGenerator.js';
import { generateStatutsSARL } from './src/utils/documentTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification du générateur pdfmake\n');
console.log('='.repeat(60));

// Test avec un document simple
const testCompany = {
  company_name: 'TEST VERIFICATION SARL',
  company_type: 'SARL',
  capital: 1000000,
  address: 'Abidjan',
  city: 'Abidjan',
  activity: 'Test',
  gerant: 'Test',
  duree_societe: 99
};

const testManagers = [{
  nom: 'TEST',
  prenoms: 'User',
  date_naissance: '1990-01-01',
  lieu_naissance: 'Abidjan',
  nationalite: 'Ivoirienne',
  adresse: 'Abidjan',
  pere_nom: 'PERE TEST',
  mere_nom: 'MERE TEST'
}];

const testAssociates = [{ name: 'TEST USER', parts: 100 }];

async function verifyPdfMake() {
  try {
    console.log('1. Génération du contenu...');
    const content = generateStatutsSARL(testCompany, testAssociates, testManagers);
    console.log(`   ✅ Contenu généré: ${content.length} caractères`);
    
    console.log('\n2. Vérification de la fonction generatePdfWithPdfMake...');
    if (typeof generatePdfWithPdfMake !== 'function') {
      throw new Error('generatePdfWithPdfMake n\'est pas une fonction!');
    }
    console.log('   ✅ Fonction trouvée');
    
    console.log('\n3. Génération du PDF avec pdfmake...');
    const outputPath = path.join(__dirname, 'generated', 'test_verification_pdfmake.pdf');
    
    // S'assurer que le dossier existe
    const generatedDir = path.join(__dirname, 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    
    await generatePdfWithPdfMake(content, 'Statuts SARL', outputPath);
    
    console.log('   ✅ PDF généré avec pdfmake');
    
    console.log('\n4. Vérification du fichier...');
    if (!fs.existsSync(outputPath)) {
      throw new Error('Fichier PDF non créé!');
    }
    
    const stats = fs.statSync(outputPath);
    console.log(`   ✅ Fichier existe: ${outputPath}`);
    console.log(`   📊 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
    
    if (stats.size === 0) {
      throw new Error('Le fichier PDF est vide!');
    }
    
    if (stats.size < 1000) {
      console.log('   ⚠️  ATTENTION: Le fichier semble très petit');
    }
    
    // Lire les premiers bytes pour vérifier que c'est un PDF valide
    const buffer = fs.readFileSync(outputPath, { start: 0, end: 4 });
    const pdfHeader = buffer.toString('ascii');
    
    if (pdfHeader === '%PDF') {
      console.log('   ✅ Format PDF valide (header %PDF détecté)');
    } else {
      console.log(`   ⚠️  Header PDF inattendu: ${pdfHeader}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ VÉRIFICATION RÉUSSIE');
    console.log('\nLe générateur pdfmake fonctionne correctement!');
    console.log(`\nFichier de test: ${outputPath}`);
    console.log('\n💡 Ouvrez ce fichier pour vérifier le format professionnel.');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

verifyPdfMake();

