import { generateDocument } from './src/utils/documentGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VÉRIFICATION DU GÉNÉRATEUR PDF\n');
console.log('='.repeat(70));

// Vérifier que pdfmake est installé
try {
  const pdfmake = await import('pdfmake');
  console.log('✅ pdfmake est installé:', pdfmake.default ? 'OUI' : 'NON');
  console.log('   Version:', Object.keys(pdfmake).join(', '));
} catch (error) {
  console.log('❌ pdfmake n\'est PAS installé:', error.message);
}

// Vérifier que pdfmakeGenerator existe
const pdfmakeGeneratorPath = path.join(__dirname, 'src/utils/pdfmakeGenerator.js');
if (fs.existsSync(pdfmakeGeneratorPath)) {
  console.log('✅ pdfmakeGenerator.js existe');
  const stats = fs.statSync(pdfmakeGeneratorPath);
  console.log('   Taille:', stats.size, 'bytes');
} else {
  console.log('❌ pdfmakeGenerator.js n\'existe PAS');
}

// Vérifier l'import dans documentGenerator
const docGenPath = path.join(__dirname, 'src/utils/documentGenerator.js');
const docGenContent = fs.readFileSync(docGenPath, 'utf8');
if (docGenContent.includes('generatePdfWithPdfMake')) {
  console.log('✅ documentGenerator.js importe generatePdfWithPdfMake');
} else {
  console.log('❌ documentGenerator.js n\'importe PAS generatePdfWithPdfMake');
}

if (docGenContent.includes('pdfmake')) {
  console.log('✅ documentGenerator.js contient une référence à pdfmake');
} else {
  console.log('❌ documentGenerator.js ne contient PAS de référence à pdfmake');
}

console.log('\n' + '='.repeat(70));
console.log('\n🧪 TEST DE GÉNÉRATION AVEC LOGS DÉTAILLÉS\n');

// Données de test
const testCompany = {
  company_name: 'TEST VERIFICATION SARL',
  company_type: 'SARL',
  capital: 1000000,
  address: 'Cocody, Abidjan',
  city: 'Abidjan',
  activity: 'Services de test',
  gerant: 'TEST USER',
  duree_societe: 99,
  chiffre_affaires_prev: 5000000
};

const testManagers = [{
  nom: 'TEST',
  prenoms: 'User',
  date_naissance: '1990-01-01',
  lieu_naissance: 'Abidjan',
  nationalite: 'Ivoirienne',
  adresse: 'Cocody',
  pere_nom: 'TEST Père',
  mere_nom: 'TEST Mère'
}];

// Test avec un seul document pour voir les logs
console.log('📄 Test: Génération "Statuts SARL" en PDF uniquement\n');

try {
  const result = await generateDocument(
    'Statuts SARL',
    testCompany,
    [],
    testManagers,
    {},
    { formats: ['pdf'] }
  );

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RÉSULTAT:\n');

  if (result.pdf) {
    const pdfPath = result.pdf.filePath;
    const exists = fs.existsSync(pdfPath);
    const stats = exists ? fs.statSync(pdfPath) : null;
    
    console.log('✅ PDF généré:', result.pdf.fileName);
    console.log('   Chemin:', pdfPath);
    console.log('   Existe:', exists ? 'OUI' : 'NON');
    
    if (stats) {
      console.log('   Taille:', (stats.size / 1024).toFixed(2), 'KB');
      console.log('   Date:', stats.mtime.toISOString());
      
      // Lire les premiers bytes pour vérifier le format PDF
      const buffer = fs.readFileSync(pdfPath, { start: 0, end: 4 });
      const header = buffer.toString('ascii');
      if (header === '%PDF') {
        console.log('   Format: PDF valide (header %PDF détecté)');
      } else {
        console.log('   ⚠️  Format: Header PDF non détecté:', header);
      }
    }
  } else {
    console.log('❌ Aucun PDF généré');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📋 FORMATS DES DOCUMENTS:\n');
  console.log('PDF: Généré avec pdfmake (format professionnel)');
  console.log('   - Structure déclarative');
  console.log('   - Styles professionnels (header, section, article, etc.)');
  console.log('   - Gestion automatique des sauts de page');
  console.log('   - Alignements précis');
  console.log('\nDOCX: Généré avec docx (bibliothèque docx)');
  console.log('   - Format Word standard');
  console.log('   - Compatible Microsoft Word');
  console.log('   - Styles et formatage préservés');

} catch (error) {
  console.error('\n❌ ERREUR:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n' + '='.repeat(70));
console.log('\n💡 Pour voir les logs détaillés, vérifiez les messages ci-dessus.');
console.log('   Si vous voyez "✅ PDF généré avec pdfmake", le nouveau générateur fonctionne.');
console.log('   Si vous voyez "✅ PDF généré avec PDFKit (fallback)", pdfmake a échoué.\n');

