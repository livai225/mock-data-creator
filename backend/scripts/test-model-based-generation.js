import { generateDocumentFromModel } from '../src/utils/modelBasedGenerator.js';

console.log('🧪 TEST DU SYSTÈME DE GÉNÉRATION BASÉ SUR MODÈLES\n');

// Données de test
const testCompany = {
  company_name: 'ENTREPRISE TEST SARL',
  company_type: 'SARL_PLURI',
  capital: '1000000',
  address: '123 Rue Test, Abidjan',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  telephone: '0102030405',
  email: 'test@entreprise.ci',
  duree_societe: '99',
  objet_social: 'Commerce et services'
};

const testAssociates = [
  {
    nom: 'Doe',
    prenoms: 'John',
    parts: '600000'
  },
  {
    nom: 'Smith',
    prenoms: 'Jane',
    parts: '400000'
  }
];

const testManagers = [
  {
    nom: 'Manager',
    prenoms: 'Test',
    profession: 'Gérant',
    adresse: '456 Rue Manager, Abidjan',
    ville_residence: 'Abidjan',
    nationalite: 'Ivoirienne',
    date_naissance: '1980-01-01',
    lieu_naissance: 'Abidjan',
    type_identite: 'CNI',
    numero_identite: 'CI123456789',
    date_delivrance_id: '2020-01-01',
    date_validite_id: '2030-01-01',
    lieu_delivrance_id: 'Abidjan'
  }
];

const testAdditionalData = {
  commune: 'Cocody',
  quartier: 'Riviera',
  lot: 'LOT123',
  ilot: 'ILOT456'
};

async function testGeneration() {
  const testDocs = [
    'Statuts',
    'Contrat de bail',
    'Liste des gérants',
    'Déclaration sur l\'honneur'
  ];

  for (const docName of testDocs) {
    console.log(`\n📄 Test génération: ${docName}`);
    console.log('='.repeat(50));
    
    try {
      const result = await generateDocumentFromModel(
        docName,
        testCompany,
        testAssociates,
        testManagers,
        testAdditionalData,
        { formats: ['pdf', 'docx'] }
      );
      
      if (result.error) {
        console.log(`❌ Erreur: ${result.error}`);
      } else {
        console.log('✅ Succès!');
        console.log(`   PDF généré: ${result.pdf ? 'OUI' : 'NON'}`);
        console.log(`   DOCX généré: ${result.docx ? 'OUI' : 'NON'}`);
        if (result.pdf) console.log(`   Chemin PDF: ${result.pdf.filePath}`);
        if (result.docx) console.log(`   Chemin DOCX: ${result.docx.filePath}`);
      }
    } catch (error) {
      console.log(`❌ Erreur critique: ${error.message}`);
    }
  }
}

// Exécuter le test
testGeneration().then(() => {
  console.log('\n🏁 FIN DES TESTS');
}).catch(error => {
  console.error('❌ Erreur lors des tests:', error);
});
