/**
 * Script de test complet : Création d'entreprise et génération de documents
 */

import { generateMultipleDocuments } from './src/utils/documentGenerator.js';
import Company from './src/models/Company.js';
import Document from './src/models/Document.js';
import User from './src/models/User.js';
import { testConnection } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à la base de données
const connected = await testConnection();
if (!connected) {
  console.error('❌ Impossible de se connecter à la base de données');
  process.exit(1);
}
console.log('✅ Connexion à la base de données établie\n');

// Créer un utilisateur de test
async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...');
  
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'Test123456!';
  
  // Vérifier si l'utilisateur existe déjà
  let user = await User.findByEmail(testEmail);
  
  if (!user) {
    const userId = await User.create({
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+225 07 12 34 56 78',
      role: 'user'
    });
    user = await User.findById(userId);
    console.log(`✅ Utilisateur créé: ${testEmail} (ID: ${user.id})`);
  } else {
    console.log(`ℹ️  Utilisateur existant: ${testEmail} (ID: ${user.id})`);
  }
  
  return user;
}

// Créer une entreprise de test
async function createTestCompany(userId) {
  console.log('\n🏢 Création d\'une entreprise de test...');
  
  const companyData = {
    userId: userId,
    companyType: 'SARLU',
    companyName: `TEST COMPANY ${Date.now()}`,
    activity: 'Commerce général, import-export, vente de produits divers',
    capital: 1000000,
    address: '123 Rue Test, Cocody Angré, LOT 5, ILOT 10',
    city: 'Abidjan',
    gerant: 'Jean Dupont',
    paymentAmount: 50000,
    chiffreAffairesPrev: 5000000,
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
  
  const companyId = await Company.create(companyData, associates);
  const company = await Company.findById(companyId);
  
  console.log(`✅ Entreprise créée: ${company.company_name} (ID: ${company.id})`);
  console.log(`   Type: ${company.company_type}`);
  console.log(`   Capital: ${company.capital.toLocaleString('fr-FR')} FCFA`);
  
  return company;
}

// Générer les documents pour l'entreprise
async function generateCompanyDocuments(company) {
  console.log('\n📄 Génération des documents pour l\'entreprise...');
  
  // Liste des documents à générer
  const docs = [
    'Statuts SARL',
    'Contrat de bail commercial',
    'Formulaire unique CEPICI',
    'Liste des dirigeants/gérants',
    'Déclaration sur l\'honneur (greffe)',
    'Déclaration de Souscription et Versement (DSV)'
  ];
  
  // Récupérer les associés et managers depuis la DB
  const companyFull = await Company.findById(company.id);
  
  // Préparer les données
  const companyData = {
    company_name: companyFull.company_name,
    capital: companyFull.capital,
    address: companyFull.address,
    city: companyFull.city,
    activity: companyFull.activity,
    gerant: companyFull.gerant,
    duree_societe: 99,
    chiffre_affaires_prev: companyFull.chiffre_affaires_prev,
    managers: companyFull.managers || []
  };
  
  const associates = (companyFull.associates || []).map(a => ({
    name: a.name,
    parts: a.parts
  }));
  const managers = companyFull.managers || [];
  
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
  
  console.log(`   Documents à générer: ${docs.length}`);
  console.log(`   - ${docs.join('\n   - ')}\n`);
  
  // Générer les documents
  const results = await generateMultipleDocuments(
    docs,
    companyData,
    associates,
    managers,
    additionalData,
    { formats: ['pdf', 'docx'] }
  );
  
  console.log(`\n📦 Résultats de génération:`);
  console.log('='.repeat(60));
  
  const createdDocs = [];
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    console.log(`\n${i + 1}. ${result.docName}`);
    
    if (result.error) {
      console.log(`   ❌ Erreur: ${result.error}`);
      continue;
    }
    
    // Sauvegarder le PDF en DB
    if (result.pdf) {
      const pdfDocId = await Document.create({
        userId: company.user_id,
        companyId: company.id,
        docType: `pdf_${result.docName.toLowerCase().replace(/\s+/g, '_')}`,
        docName: result.docName,
        fileName: result.pdf.fileName,
        filePath: result.pdf.filePath,
        mimeType: result.pdf.mimeType
      });
      
      const stats = fs.statSync(result.pdf.filePath);
      console.log(`   ✅ PDF: ${result.pdf.fileName} (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`      ID DB: ${pdfDocId}`);
      createdDocs.push({ ...result.pdf, docId: pdfDocId, docName: result.docName });
    }
    
    // Sauvegarder le DOCX en DB
    if (result.docx) {
      const docxDocId = await Document.create({
        userId: company.user_id,
        companyId: company.id,
        docType: `docx_${result.docName.toLowerCase().replace(/\s+/g, '_')}`,
        docName: result.docName,
        fileName: result.docx.fileName,
        filePath: result.docx.filePath,
        mimeType: result.docx.mimeType
      });
      
      const stats = fs.statSync(result.docx.filePath);
      console.log(`   ✅ DOCX: ${result.docx.fileName} (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`      ID DB: ${docxDocId}`);
      createdDocs.push({ ...result.docx, docId: docxDocId, docName: result.docName });
    }
  }
  
  return { results, createdDocs };
}

// Vérifier les documents créés
async function verifyDocuments(companyId, userId) {
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Vérification des documents créés...\n');
  
  // Récupérer tous les documents de l'entreprise
  const documents = await Document.findByCompanyId(companyId);
  
  console.log(`📋 Documents trouvés en base de données: ${userDocuments.length}\n`);
  
  if (userDocuments.length === 0) {
    console.log('❌ Aucun document trouvé !');
    return userDocuments;
  }
  
  // Filtrer par utilisateur
  const userDocuments = documents.filter(doc => doc.user_id === userId);
  
  // Grouper par type de document
  const docsByType = {};
  userDocuments.forEach(doc => {
    const docName = doc.doc_name;
    if (!docsByType[docName]) {
      docsByType[docName] = [];
    }
    docsByType[docName].push(doc);
  });
  
  console.log('📊 Documents par type:');
  console.log('-'.repeat(60));
  
  Object.keys(docsByType).forEach(docName => {
    const docs = docsByType[docName];
    console.log(`\n📄 ${docName}:`);
    docs.forEach(doc => {
      const fileExists = fs.existsSync(doc.file_path);
      const fileSize = fileExists ? fs.statSync(doc.file_path).size : 0;
      console.log(`   ${doc.mime_type.includes('pdf') ? '📕' : '📘'} ${doc.file_name}`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      Taille: ${(fileSize / 1024).toFixed(2)} KB`);
      console.log(`      Fichier existe: ${fileExists ? '✅' : '❌'}`);
      console.log(`      Chemin: ${doc.file_path}`);
    });
  });
  
  return userDocuments;
}

// Fonction principale
async function main() {
  try {
    console.log('🧪 TEST COMPLET : CRÉATION D\'ENTREPRISE ET GÉNÉRATION DE DOCUMENTS');
    console.log('='.repeat(60));
    
    // 1. Créer un utilisateur de test
    const user = await createTestUser();
    
    // 2. Créer une entreprise de test
    const company = await createTestCompany(user.id);
    
    // 3. Générer les documents
    const { results, createdDocs } = await generateCompanyDocuments(company);
    
    // 4. Vérifier les documents
    const allDocuments = await verifyDocuments(company.id, user.id);
    
    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RÉSUMÉ FINAL\n');
    console.log(`✅ Utilisateur créé: ${user.email} (ID: ${user.id})`);
    console.log(`✅ Entreprise créée: ${company.companyName} (ID: ${company.id})`);
    console.log(`✅ Documents générés: ${createdDocs.length}`);
    console.log(`✅ Documents en DB: ${allDocuments?.length || 0}`);
    
    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;
    
    console.log(`\n📈 Statistiques:`);
    console.log(`   Documents générés avec succès: ${successCount}/${results.length}`);
    console.log(`   Documents en erreur: ${failCount}/${results.length}`);
    
    if (failCount > 0) {
      console.log(`\n❌ Documents en erreur:`);
      results.filter(r => r.error).forEach(r => {
        console.log(`   - ${r.docName}: ${r.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Pour vérifier:');
    console.log(`   1. Ouvrez les fichiers dans: backend/generated/`);
    console.log(`   2. Vérifiez en DB: SELECT * FROM documents WHERE company_id = ${company.id}`);
    console.log(`   3. Vérifiez que tous les articles sont présents dans les PDF\n`);
    
    console.log('✅ Test terminé avec succès !\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
    await db.close();
    process.exit(1);
  }
}

// Exécuter le test
main();

