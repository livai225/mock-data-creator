/**
 * Script de vérification : Comparer les templates backend avec les modèles de référence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  generateStatutsSARL, 
  generateContratBail, 
  generateDSV, 
  generateListeGerants, 
  generateDeclarationHonneur, 
  generateFormulaireCEPICI 
} from './src/utils/documentTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Compter les articles dans un texte
function countArticles(text) {
  const articlePattern = /ARTICLE\s+\d+|Article\s+\d+/gi;
  const matches = text.match(articlePattern);
  return matches ? matches.length : 0;
}

// Extraire les numéros d'articles
function extractArticleNumbers(text) {
  const articlePattern = /ARTICLE\s+(\d+)|Article\s+(\d+)/gi;
  const articles = [];
  let match;
  while ((match = articlePattern.exec(text)) !== null) {
    const num = parseInt(match[1] || match[2]);
    if (!articles.includes(num)) {
      articles.push(num);
    }
  }
  return articles.sort((a, b) => a - b);
}

// Test avec des données de test
const testCompany = {
  company_name: 'TEST COMPANY',
  capital: 1000000,
  address: '123 Rue Test',
  city: 'Abidjan',
  activity: 'Commerce général',
  gerant: 'Jean Dupont',
  duree_societe: 99,
  chiffre_affaires_prev: 5000000
};

const testAssociates = [{
  name: 'Jean Dupont',
  parts: 100
}];

const testManagers = [{
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

const testBailleurData = {
  bailleur_nom: 'Marie Martin',
  bailleur_telephone: '+225 07 12 34 56 78',
  loyer_mensuel: 500000,
  caution_mois: 2,
  avance_mois: 2,
  duree_bail: 3,
  date_debut: new Date().toISOString()
};

console.log('🔍 VÉRIFICATION DES TEMPLATES BACKEND');
console.log('='.repeat(60));
console.log('');

// 1. Statuts SARL (SARLU)
console.log('📄 1. STATUTS SARL (SARLU)');
console.log('-'.repeat(60));
const statutsSARLU = generateStatutsSARL(testCompany, testAssociates, testManagers);
const statutsSARLUArticles = extractArticleNumbers(statutsSARLU);
console.log(`   Articles trouvés: ${statutsSARLUArticles.length}`);
console.log(`   Numéros: ${statutsSARLUArticles.join(', ')}`);
console.log(`   Attendu: 25 articles (pour SARLU)`);
console.log(`   ✅ ${statutsSARLUArticles.length === 25 ? 'CONFORME' : '⚠️ NON CONFORME'}`);
console.log('');

// 2. Statuts SARL (Pluripersonnelle)
console.log('📄 2. STATUTS SARL (PLURIPERSONNELLE)');
console.log('-'.repeat(60));
const testAssociatesPluri = [
  { name: 'Jean Dupont', parts: 50 },
  { name: 'Marie Martin', parts: 50 }
];
const statutsSARLPluri = generateStatutsSARL(testCompany, testAssociatesPluri, testManagers);
const statutsSARLPluriArticles = extractArticleNumbers(statutsSARLPluri);
console.log(`   Articles trouvés: ${statutsSARLPluriArticles.length}`);
console.log(`   Numéros: ${statutsSARLPluriArticles.join(', ')}`);
console.log(`   Attendu: 31 articles (pour SARL Pluripersonnelle)`);
console.log(`   ✅ ${statutsSARLPluriArticles.length === 31 ? 'CONFORME' : '⚠️ NON CONFORME'}`);
console.log('');

// 3. Contrat de bail
console.log('📄 3. CONTRAT DE BAIL COMMERCIAL');
console.log('-'.repeat(60));
const contratBail = generateContratBail(testCompany, testBailleurData);
const contratBailArticles = extractArticleNumbers(contratBail);
console.log(`   Articles trouvés: ${contratBailArticles.length}`);
console.log(`   Numéros: ${contratBailArticles.join(', ')}`);
console.log(`   Attendu: 9 articles (Article 1 à Article 9)`);
const expectedBailArticles = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const bailConforme = expectedBailArticles.every(a => contratBailArticles.includes(a)) && contratBailArticles.length === 9;
console.log(`   ✅ ${bailConforme ? 'CONFORME' : '⚠️ NON CONFORME'}`);
if (!bailConforme) {
  const missing = expectedBailArticles.filter(a => !contratBailArticles.includes(a));
  const extra = contratBailArticles.filter(a => !expectedBailArticles.includes(a));
  if (missing.length > 0) console.log(`   ⚠️ Articles manquants: ${missing.join(', ')}`);
  if (extra.length > 0) console.log(`   ⚠️ Articles supplémentaires: ${extra.join(', ')}`);
}
console.log('');

// 4. DSV
console.log('📄 4. DÉCLARATION SOUSCRIPTION/VERSEMENT (DSV)');
console.log('-'.repeat(60));
const dsv = generateDSV(testCompany, testAssociates);
const dsvLength = dsv.length;
console.log(`   Longueur du contenu: ${dsvLength} caractères`);
console.log(`   Contient objet social complet: ${dsv.includes('l\'acquisition, la location') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient tableau associés: ${dsv.includes('Nombre de parts') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient dépôt bancaire: ${dsv.includes('déposée pour le compte') ? '✅ OUI' : '❌ NON'}`);
console.log('');

// 5. Liste des gérants
console.log('📄 5. LISTE DES GÉRANTS');
console.log('-'.repeat(60));
const listeGerants = generateListeGerants(testCompany, testManagers);
const listeGerantsLength = listeGerants.length;
console.log(`   Longueur du contenu: ${listeGerantsLength} caractères`);
console.log(`   Contient nom complet: ${listeGerants.includes('Jean Dupont') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient pièce identité: ${listeGerants.includes('CI123456789') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient durée mandat: ${listeGerants.includes('quatre') || listeGerants.includes('4') ? '✅ OUI' : '❌ NON'}`);
console.log('');

// 6. Déclaration sur l'honneur
console.log('📄 6. DÉCLARATION SUR L\'HONNEUR');
console.log('-'.repeat(60));
const declarationHonneur = generateDeclarationHonneur(testCompany, testManagers);
const declarationLength = declarationHonneur.length;
console.log(`   Longueur du contenu: ${declarationLength} caractères`);
console.log(`   Contient référence légale: ${declarationHonneur.includes('Article 47') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient engagement 75 jours: ${declarationHonneur.includes('75 jours') || declarationHonneur.includes('soixante-quinze') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient casier judiciaire: ${declarationHonneur.includes('casier judiciaire') ? '✅ OUI' : '❌ NON'}`);
console.log('');

// 7. Formulaire CEPICI
console.log('📄 7. FORMULAIRE UNIQUE CEPICI');
console.log('-'.repeat(60));
const formulaireCEPICI = generateFormulaireCEPICI(testCompany, testManagers, testAssociates);
const cepiciLength = formulaireCEPICI.length;
console.log(`   Longueur du contenu: ${cepiciLength} caractères`);
console.log(`   Contient en-tête CEPICI: ${formulaireCEPICI.includes('CEPICI') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient section identification: ${formulaireCEPICI.includes('IDENTIFICATION') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient section activité: ${formulaireCEPICI.includes('ACTIVITE') ? '✅ OUI' : '❌ NON'}`);
console.log(`   Contient section dirigeants: ${formulaireCEPICI.includes('DIRIGEANTS') ? '✅ OUI' : '❌ NON'}`);
console.log('');

console.log('='.repeat(60));
console.log('');
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('');
console.log(`✅ Statuts SARL (SARLU): ${statutsSARLUArticles.length === 25 ? 'CONFORME (25 articles)' : `⚠️ NON CONFORME (${statutsSARLUArticles.length} articles au lieu de 25)`}`);
console.log(`✅ Statuts SARL (Pluripersonnelle): ${statutsSARLPluriArticles.length === 31 ? 'CONFORME (31 articles)' : `⚠️ NON CONFORME (${statutsSARLPluriArticles.length} articles au lieu de 31)`}`);
console.log(`✅ Contrat de bail: ${bailConforme ? 'CONFORME (9 articles)' : `⚠️ NON CONFORME (${contratBailArticles.length} articles)`}`);
console.log(`✅ DSV: ${dsvLength > 3000 ? 'CONFORME (contenu complet)' : '⚠️ VÉRIFIER LE CONTENU'}`);
console.log(`✅ Liste gérants: ${listeGerantsLength > 400 ? 'CONFORME (contenu complet)' : '⚠️ VÉRIFIER LE CONTENU'}`);
console.log(`✅ Déclaration honneur: ${declarationLength > 1000 ? 'CONFORME (contenu complet)' : '⚠️ VÉRIFIER LE CONTENU'}`);
console.log(`✅ Formulaire CEPICI: ${cepiciLength > 4000 ? 'CONFORME (contenu complet)' : '⚠️ VÉRIFIER LE CONTENU'}`);
console.log('');

